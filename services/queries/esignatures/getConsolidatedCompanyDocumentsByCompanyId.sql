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
    Type nvarchar(max),
    IsPublishedToEmployee bit,
    ExistsInTaskList bit
);

insert into @tmp
select
    cast(d.ID as nvarchar(max)) as ID,
    UploadDate,
    u.FirstName,
    u.LastName,
    Filename,
    Title,
    DocumentCategory,
    'legacy',
    IsPublishedToEmployee,
    ExistsInTaskList = (
        case
            when (
                select
                    count(*)
                from
                    dbo.OnboardingTaskStep o
                where
                    o.CompanyDoc_CompanyDocKeys like '%' + cast(d.ID as varchar(max)) + '%'
            ) > 0 then 1
            else 0
        end
    )
from 
    dbo.Document d
    inner join dbo.HRnextUser u
    on u.Username = d.UploadByUsername
where
    CompanyID = @_companyId

insert into @tmp
select
    e.ID,
    e.UploadDate,
    null,
    null,
    null,
    null,
    null,
    'esignature',
    null,
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
    e.Type = '@type'

insert into @tmp
select
    ID,
    UploadDate,
    UploadedBy,
    null,
    Pointer,
    Title,
    Category,
    'non-signature',
    IsPublishedToEmployee,
    ExistsInTaskList = 0 -- documents in FileMetadata should never show up in a task list
from
    dbo.FileMetadata
where
    CompanyID = @_companyId and
    EmployeeCode is null

-- get total count for pagination
select count(*) as totalCount from @tmp

select * from @tmp
order by UploadDate desc