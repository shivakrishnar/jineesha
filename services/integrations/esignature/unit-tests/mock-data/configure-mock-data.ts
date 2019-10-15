enum Operation {
    Add = 'add',
    Remove = 'remove',
    Delete = 'delete',
}

export const addConfigurationRequest = {
    op: Operation.Add,
};

export const removeConfigurationRequest = {
    op: Operation.Remove,
};

export const deleteConfigurationRequest = {
    op: Operation.Delete,
};
