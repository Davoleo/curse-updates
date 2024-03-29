import {
    ActionRowBuilder,
    ComponentType,
    ModalBuilder,
    ModalSubmitInteraction,
    Snowflake,
    TextInputBuilder,
    TextInputStyle
} from "discord.js";
import UpdatesService from "../services/UpdatesService.js";
import GameTag from "../model/GameTag.js";
import GuildService from "../services/GuildService.js";
import {logger} from "../main.js";

export interface Modal {
    readonly id: string

    compose(): Promise<ModalBuilder>

    handleSubmission(interaction: ModalSubmitInteraction): void
}

export class FilterModal implements Modal {

    public static readonly TAGS_FILTER_INPUT = 'tagsFilterInput'
    public static readonly PROJECTS_FILTER_INPUT = 'projectsFilterInput'

    public readonly id = 'filtersModal';

    constructor(public serverId: Snowflake, public configId: number) {}

    async compose() {
        const modal = new ModalBuilder()
            .setCustomId(this.id)
            .setTitle(`Filters (Config n°${this.configId})`)

        const filters = await UpdatesService.getFilterStrings(this.serverId, this.configId)

        // const messageInput = new TextInputBuilder()
        //     .setCustomId('messsageInput')
        //     .setLabel("Update Message (Empty means disabled)")
        //     .setStyle(TextInputStyle.Paragraph)
        // const messageInputRow = new ActionRowBuilder<TextInputBuilder>().addComponents(messageInput);

        const fileTagsFilterInput = new TextInputBuilder()
            .setCustomId(FilterModal.TAGS_FILTER_INPUT)
            .setStyle(TextInputStyle.Short)
            .setLabel("Game Version Tags (Empty means all included)")
            .setPlaceholder("GAME1:TAG1|GAME2:TAG2|...")
            .setRequired(false)
            .setValue(filters.tags ?? '')
        const fileTagsInputRow = new ActionRowBuilder<TextInputBuilder>().addComponents(fileTagsFilterInput);

        const projectsFilterInput = new TextInputBuilder()
            .setCustomId(FilterModal.PROJECTS_FILTER_INPUT)
            .setStyle(TextInputStyle.Short)
            .setLabel("Project IDs (Empty Means all included)")
            .setPlaceholder("PROJ1|PROJ2|...")
            .setRequired(false)
            .setValue(filters.projects ?? '')
        const projectsInputRow = new ActionRowBuilder<TextInputBuilder>().addComponents(projectsFilterInput);

        modal.addComponents(fileTagsInputRow, projectsInputRow)
        return modal
    }

    async handleSubmission(interaction: ModalSubmitInteraction) {

        const tagsString = interaction.fields.getField(FilterModal.TAGS_FILTER_INPUT, ComponentType.TextInput).value
        const projectsString = interaction.fields.getField(FilterModal.PROJECTS_FILTER_INPUT, ComponentType.TextInput).value;
        logger.debug("setfilters (tags): " + tagsString);
        logger.debug("setfilters (projects): " + projectsString);

        if (tagsString.length > 0) {
            const tags = tagsString?.split('|').map(stag => GameTag.fromString(stag));

            for (const tag of tags) {
                try {
                    tag.validate();
                }
                catch (e) {
                    if (e instanceof Error) {
                        await interaction.reply(":x: Tags Filter format invalid: " + e.message)
                        await interaction.followUp("Broken Filters Input\n" +
                            "Tags Filter: `" + tagsString + '`\n' +
                            "Projects Filter: `" + projectsString + '`')
                        return;
                    }
                    else {
                        throw e;
                    }
                }
            }

            await UpdatesService.setTagsFilter(this.serverId, this.configId, tags);
        }

        const serverConfig = await GuildService.getAllProjects(interaction.guildId!);
        const scheduledProjects = new Set<number>(serverConfig.projects.map(proj => proj.id));

        if (projectsString.length > 0) {
            const projectsStringArray = projectsString.split('|');

            const projects: number[] = new Array(projectsStringArray.length)

            for (let i = 0; i < projects.length; i++) {
                const stringId =  projectsStringArray[i].trim();

                if (stringId.length == 0) //if current project is empty string skip it
                    continue;

                const projId = Number(stringId);

                if (Number.isNaN(projId)) {
                    await interaction.reply(":x: Project N°`" + projId + "` in the whitelist filter is malformed, please fix and try again.");
                    await interaction.followUp("Broken Filters Input\n" +
                        "Tags Filter: `" + tagsString + '`\n' +
                        "Projects Filter: `" + projectsString + '`')
                    return;
                }

                if (!scheduledProjects.has(projId)) {
                    const warningMessage = ":warning: Project N°`" + projId + "` in the whitelist filter is not part of " + serverConfig.serverName + "'s scheduled projects, either add it or remove it from the whitelist."

                    if (interaction.replied) {
                        await interaction.followUp(warningMessage);
                    }
                    else {
                        await interaction.reply(warningMessage);
                    }
                }

                projects.push(projId)
            }

            await UpdatesService.setProjectsFilter(this.serverId, this.configId, projects);
        }


        void interaction.reply(":white_check_mark: Announcement Filters edited successfully!\n" +
            "Tags Filter: " + (tagsString.length !== 0 ? 'set' : 'reset') + " to `" + tagsString + '`\n' +
            "Projects Filter: " + (projectsString.length !== 0 ? 'set' : 'reset') + " to `" + projectsString + '`');
    }
}