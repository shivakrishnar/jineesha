declare @_eisgnLegacyCutoff date = @esignLegacyCutoff
declare @_month int = @month
declare @_year int = @year
;with BillableDocs as (
    select
        db_name() as tenantID,
        concat(CompanyName, ' (', PRIntegrationCompanyCode, ')') as company,
        count(CompanyID) as billableDocuments,
        CompanyID as companyId,
        null as Metadata,
        null as BillingEventType
    from
        dbo.EsignatureMetadata e
    join dbo.Company c on e.CompanyID =  c.ID
    where
        [Type] = 'SignatureRequest' and
        SignatureStatusID <> 3 and -- ID 3 is Not Required
        MONTH(UploadDate) = @_month and
        YEAR(UploadDate) = @_year and
        FileMetadataID is null and
        ((c.CreateDate <= @_eisgnLegacyCutoff and IsOnboardingDocument = 0) or c.CreateDate > @_eisgnLegacyCutoff)
    group by CompanyName, PRIntegrationCompanyCode, CompanyID
)
select * from BillableDocs
union
select
    db_name() as tenantID,
    concat(CompanyName, ' (', PRIntegrationCompanyCode, ')') as company,
    0 as billableDocuments,
    ID,
    null as Metadata,
    null as BillingEventType
from
    dbo.Company
where
    EsignatureProductTierID = 2 and -- ID 2 is E-Sign
    ID not in (select companyId from BillableDocs)
group by CompanyName, PRIntegrationCompanyCode, ID
union
select
    db_name() as tenantID,
    concat(CompanyName, ' (', PRIntegrationCompanyCode, ')') as company,
    0 as billableDocuments,
    c.ID,
    null as Metadata,
    bet.Name as BillingEventType
from
    dbo.Company c
join dbo.BillingEvent be on be.CompanyID = c.ID
join dbo.BillingEventType bet on bet.ID = be.BillingEventTypeID
where
    MONTH(be.Date) = @_month and
    YEAR(be.Date) = @_year and
    (bet.Name = 'EnhancedEsignatureDisabled' or
    bet.Name = 'EnhancedEsignatureEnabled') and
    c.ID not in (select companyId from BillableDocs)
union
select
    db_name() as tenantID,
    null as company,
    0 as billableDocuments,
    null as companyId,
    be.Metadata,
    bet.Name as BillingEventType
from dbo.BillingEvent be
join dbo.BillingEventType bet on bet.ID = be.BillingEventTypeID
where
    MONTH(be.Date) = @_month and
    YEAR(be.Date) = @_year and
    bet.Name = 'CompanyDeleted' and
    be.CompanyID is null