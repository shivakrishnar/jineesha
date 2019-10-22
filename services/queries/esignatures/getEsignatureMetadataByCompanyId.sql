declare @_companyId int = @companyId
declare @_type nvarchar(max) = '@type'

select
    count(*) as totalCount
from
    dbo.EsignatureMetadata
where
    CompanyID = @_companyId and
    Type = @_type

select
    e.ID,
    e.UploadDate,
    ExistsInTaskList = (
        case
            when (
                select
                    count(*)
                from
                    dbo.OnboardingTaskStep o
                where
                    o.CompanyDoc_CompanyDocKeys like '%' + e.ID + '%'
            ) > 0 then 1
            else 0
        end
    )
from
    dbo.EsignatureMetadata e
where
    e.CompanyID = @_companyId and
    e.Type = @_type
order by e.UploadDate desc