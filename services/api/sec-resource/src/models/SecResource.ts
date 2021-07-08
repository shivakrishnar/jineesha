export type SecResource = {
    id: string;
    resourceGroupId: number;
    resourceSubGroupId?: string;
    name?: string;
    description?: string;
    cddId?: string;
    tableColumn?: string;
    requiredRoleLevel?: number;
    isLocked: boolean;
    resourceTypeId?: string;
    parentId?: string;
    position: number;
    link?: string;
    requiredPermission?: string;
    menuClass?: string;
    isOwnWindow?: boolean;
    isVisible?: string;
    isRequired?: boolean;
}
