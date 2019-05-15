declare @_companyId int = @companyId;

declare @tmp table
(
    ID nvarchar(max),
    UploadDate datetime2 (3),
    Filename nvarchar(max),
    Title nvarchar(max),
    ESignDate datetime2 (3),
    EmailAddress nvarchar(max),
    EmployeeCode nvarchar(max),
    Type nvarchar(max)
)

insert into @tmp
select
    cast(d.ID as nvarchar(max)) as ID,
    d.UploadDate,
    d.Filename,
    d.Title,
    d.ESignDate,
    e.EmailAddress,
    e.EmployeeCode,
    'legacy'
from 
    dbo.Document d
left join
    (select ID, EmailAddress, EmployeeCode, CompanyID from dbo.Employee e where EmailAddress IN (@eeEmails)) as e on d.EmployeeID = e.ID
where
    e.CompanyID = @_companyId

insert into @tmp
select
    ID,
    UploadDate,
    null,
    null,
    null,
    null,
    null,
    'esignature'
from
    dbo.EsignatureMetadata
where
    CompanyID = @_companyId and
    Type = '@type'

-- Get total count for pagination
select count(*) as totalCount from @tmp

select * from @tmp
order by UploadDate desc