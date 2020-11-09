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
    ExistsInTaskList bit,
    IsOnboardingDocument bit
);
declare @_search nvarchar(max) = '%' + @search + '%';

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
    ),
    IsOnboardingDocument = case
        when d.DocumentCategory = 'onboarding' then 1
        else 0
    end
from 
    dbo.Document d
    left join dbo.HRnextUser u
    on u.Username = d.UploadByUsername
where
    CompanyID = @_companyId and
    (lower(isnull(d.DocumentCategory, '')) like @_search or lower(isnull(d.Title, '')) like @_search)

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
    ),
    e.IsOnboardingDocument
from
    dbo.EsignatureMetadata e
where
    e.CompanyID = @_companyId and
    e.Type = '@type' and
    (lower(isnull(e.Category, '')) like @_search or lower(isnull(e.Title, '')) like @_search)

insert into @tmp
select
    f.ID,
    f.UploadDate,
    f.UploadedBy,
    null,
    Pointer,
    f.Title,
    f.Category,
    [Type] = (
        case
            when e.[Type] = 'SimpleSignatureRequest'
            then 'simpleSign'
            else 'non-signature'
        end
    ),
    IsPublishedToEmployee,
    ExistsInTaskList = ( e.IsOnboardingDocument ),
    e.IsOnboardingDocument
from
    dbo.FileMetadata f join dbo.EsignatureMetadata e on f.EsignatureMetadataID = e.ID
where
    f.CompanyID = @_companyId and
    f.EmployeeCode is null and
    (lower(isnull(f.Category, '')) like @_search or lower(isnull(f.Title, '')) like @_search)

-- get total count for pagination
select count(*) as totalCount from @tmp

select * from @tmp
order by UploadDate desc
