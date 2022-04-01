import Command from "../../model/Command";
import { CommandGroup } from "../../model/CommandGroup";
import { CommandPermission } from "../../utils";


const comm = new Command(
    'schedule',
    "Allows management of the current server's update schedule",
    CommandGroup.SCHEDULE,
    CommandPermission.MODERATOR
)