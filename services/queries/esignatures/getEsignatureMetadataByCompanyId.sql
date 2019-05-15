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
    ID,
    UploadDate
from
    dbo.EsignatureMetadata
where
    CompanyID = @_companyId and
    Type = @_type
order by UploadDate desc