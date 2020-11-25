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
    ExistsInTaskList bit
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
    CompanyID = @_companyId and
    (lower(isnull(d.DocumentCategory, '')) like @_search or lower(isnull(d.Title, '')) like @_search) and
    lower(d.DocumentCategory) = 'onboarding'

insert into @tmp
select
    e.ID,
    e.UploadDate,
	e.UploadedBy,
    NULL,
    Filename,
    Title,
    Category,
    Type = 
        case
            when Type='SimpleSignatureRequest' then 'simpleSign'
			when Type='NoSignature' then 'non-signature'
			else 'esignature'
		end,
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
    (lower(isnull(e.Category, '')) like @_search or lower(isnull(e.Title, '')) like @_search) and
    isOnboardingDocument = 1 and 
    Type<>'SignatureRequest'

-- get total count for pagination
select count(*) as totalCount from @tmp

select * from @tmp
order by UploadDate desc