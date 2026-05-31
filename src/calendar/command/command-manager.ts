import type { CommandEvent } from "./command-event.interface";
import type { CalendarCompleteEventData } from "../types/CalendarTypes";

export class CommandManager {
    private readonly commands = new Map<string, CommandEvent>();
    private selectedKey?: string;

    add(commandName: string, command: CommandEvent): CommandEvent {
        this.commands.set(commandName, command);
        return command;
    }

    del(commandName: string): void {
        this.commands.delete(commandName);
        if (this.selectedKey === commandName) this.selectedKey = undefined;
    }

    async select(commandName: string): Promise<CalendarCompleteEventData | null> {
        const cmd = this.commands.get(commandName);
        if (!cmd) throw new Error(`Command '${commandName}' not found`);
        this.selectedKey = commandName;
        return await cmd.execute();
    }

    async undo(): Promise<CalendarCompleteEventData | null> {
        if (!this.selectedKey) return null;
        const cmd = this.commands.get(this.selectedKey);
        if (!cmd) return null;
        return await cmd.undo();
    }

    clear(): void {
        this.commands.clear();
        this.selectedKey = undefined;
    }
}
