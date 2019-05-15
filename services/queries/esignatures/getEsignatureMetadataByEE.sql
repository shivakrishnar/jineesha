declare @_type nvarchar(max) = '@type'

select
    count(*) as totalCount
from
    dbo.EsignatureMetadata
where
    EmployeeCode in (@employeeCodes) and
    Type = @_type

select
    ID,
    UploadDate
from
    dbo.EsignatureMetadata
where
    EmployeeCode in (@employeeCodes) and
    Type = @_type
order by UploadDate desc