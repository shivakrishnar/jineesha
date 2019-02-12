insert into dbo.HRnextAudit (
    TransactionName,
    UserName,
    AuditDate
) values (
    '@transactionName',
    '@userEmail',
    getdate()
)

select scope_identity() as auditId;