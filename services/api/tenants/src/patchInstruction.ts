export enum PatchOperation {
    Add = 'add',
    Remove = 'remove',
    Replace = 'replace',
    Copy = 'copy',
    Move = 'move',
    Undo = 'undo',
    Test = 'test',
}

export class PatchInstruction {
    op: PatchOperation;

    path?: string;

    value?: any;

    public constructor(init?: Partial<PatchInstruction>) {
        Object.assign(this, init);
    }
}
