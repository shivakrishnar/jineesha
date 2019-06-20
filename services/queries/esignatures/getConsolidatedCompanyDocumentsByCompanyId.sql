declare @_companyId int = @companyId;
declare @tmp table
(
    ID nvarchar(max),
    UploadDate datetime2 (3),
    FirstName nvarchar(max),
    LastName nvarchar(max),
    Filename nvarchar(max),
    Title nvarchar(max),
    Category nvarchar(max),
    Type nvarchar(max)
)

insert into @tmp
select
    cast(d.ID as nvarchar(max)) as ID,
    UploadDate,
    u.FirstName,
    u.LastName,
    Filename,
    Title,
    DocumentCategory,
    'legacy'
from 
    dbo.Document d
    inner join dbo.HRnextUser u
    on u.Username = d.UploadByUsername
where
    CompanyID = @_companyId

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

insert into @tmp
select
    ID,
    UploadDate,
    UploadedBy,
    null,
    Pointer,
    Title,
    Category,
    'non-signature'
from
    dbo.FileMetadata
where
    CompanyID = @_companyId and
    EmployeeCode is null

-- get total count for pagination
select count(*) as totalCount from @tmp

select * from @tmp
order by UploadDate desc