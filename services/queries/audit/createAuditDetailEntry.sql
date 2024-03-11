insert into dbo.HRnextAuditDetail (
    HRnextAuditID,
    CompanyID,
    AffectedEmployee,
    ActionType,
    FieldChanged,
    OldValue,
    NewValue,
    AreaOfChange,
    KeyDetails
) values (
    @auditId,
    @companyId,
    @affectedEmployee,
    '@actionType',
    '@fieldChanged',
    '@oldValue',
    '@newValue',
    '@areaOfChange',
    @keyDetails
)