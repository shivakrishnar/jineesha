declare @_companyId int = @companyId
declare @_type nvarchar(max) = '@type'
declare @_search nvarchar(max) = '%' + @search + '%';

select
    count(*) as totalCount
from
    dbo.EsignatureMetadata
where
    CompanyID = @_companyId and
    Type = @_type and
    (lower(isnull(Category, '')) like @_search or lower(isnull(Title, '')) like @_search)

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
    ),
    e.IsOnboardingDocument
from
    dbo.EsignatureMetadata e
where
    e.CompanyID = @_companyId and
    e.Type = @_type and
    (lower(isnull(e.Category, '')) like @_search or lower(isnull(e.Title, '')) like @_search)
order by e.UploadDate desc