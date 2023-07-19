import {
    ActionRowBuilder,
    ComponentType,
    ModalBuilder,
    ModalSubmitInteraction,
    Snowflake,
    TextInputBuilder,
    TextInputStyle
} from "discord.js";
import {CurseHelper} from "../curseHelper";
import {activeModals} from "../main";
import UpdatesService from "../services/UpdatesService";
import GameTag from "../model/GameTag";
import GuildService from "../services/GuildService";

export interface Modal {
    readonly id: string

    compose(): Promise<ModalBuilder>

    handleSubmission(interaction: ModalSubmitInteraction): void
}

export class FilterModal implements Modal {

    public static readonly TAGS_FILTER_INPUT = 'tagsFilterInput'
    public static readonly PROJECTS_FILTER_INPUT = 'projectsFilterInput'

    public readonly id = 'filtersModal';

    constructor(public configId: number, author: Snowflake) {
        activeModals.set(author, this)
    }

    async compose() {
        const modal = new ModalBuilder()
            .setCustomId(this.id)
            .setTitle(`Announcements Filters (Config n°${this.configId})`)

        await UpdatesService.getFilters(this.configId)

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
        const fileTagsInputRow = new ActionRowBuilder<TextInputBuilder>().addComponents(fileTagsFilterInput);

        const projectsFilterInput = new TextInputBuilder()
            .setCustomId(FilterModal.PROJECTS_FILTER_INPUT)
            .setStyle(TextInputStyle.Short)
            .setLabel("Project IDs (Empty Means all included)")
            .setPlaceholder("PROJ1|PROJ2|...")
        const projectsInputRow = new ActionRowBuilder<TextInputBuilder>().addComponents(projectsFilterInput);

        modal.addComponents(fileTagsInputRow, projectsInputRow)
        return modal
    }

    async handleSubmission(interaction: ModalSubmitInteraction) {

        const tagsString = interaction.fields.getField(FilterModal.TAGS_FILTER_INPUT, ComponentType.TextInput).value
        const projectString = interaction.fields.getField(FilterModal.PROJECTS_FILTER_INPUT, ComponentType.TextInput).value.split('|')

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
                            "Tags Filter: " + tagsString + '`\n' +
                            "Projects Filter: " + projectString.join('|') + '`')
                        return;
                    }
                    else {
                        throw e;
                    }
                }
            }

            await UpdatesService.setTagsFilter(this.configId, tags);
        }

        const serverConfig = await GuildService.getAllProjects(interaction.guildId!);
        const scheduledProjects = new Set<number>(serverConfig.projects.map(proj => proj.id));

        const projects: number[] = new Array(projectString.length)

        for (let i = 0; i < projects.length; i++) {
            const projId = Number(projectString[i]);

            if (Number.isNaN(projId)) {
                await interaction.reply(":x: Project N°`" + projId + "` in the whitelist filter is malformed, please fix and try again.");
                await interaction.followUp("Broken Filters Input\n" +
                    "Tags Filter: " + tagsString + '`\n' +
                    "Projects Filter: " + projectString + '`')
                return;
            }

            if (!scheduledProjects.has(projId)) {
                await interaction.reply(":warning: Project N°`" + projId + "` in the whitelist filter is not part of " + serverConfig.serverName + "'s scheduled projects, either add it or remove it from the whitelist.")
            }

            projects.push(projId)
        }

        await UpdatesService.setProjectsFilter(this.configId, projects);

        void interaction.reply(":white_check_mark: Announcement Filters edited successfully!\n" +
            "Tags Filter: " + (tagsString.length !== 0 ? 'set' : 'reset') + " to `" + tagsString + '`\n' +
            "Projects Filter: " + (projectString.length !== 0 ? 'set' : 'reset') + " to `" + projectString + '`');
    }
}