-------------------------------------------------------------------------------
--- List All Employees' Documents 
--  description:  Collates both legacy documents uploaded and associated 
--                with the employee and documents e-signed by the employee
-------------------------------------------------------------------------------

declare @_user nvarchar(max) = '@user'
declare @_search as nvarchar(max) = '%' + @search + '%';

declare @tmp table
(
    ID  bigint,
    CompanyID int,
    CompanyName nvarchar(max), 
    Title nvarchar(max),
    Filename nvarchar(max),
    Category nvarchar(max),
    UploadDate datetime2(3),
    EsignDate datetime2(3),
    IsLegacyDocument bit,
    IsPublishedToEmployee bit,
    IsPrivateDocument bit,
    EmployeeCode nvarchar(max),
    EmployeeID int,
    FirstName nvarchar(max),
    LastName nvarchar(max),
    UploadedBy nvarchar(max)
)

;with LegacyDocuments as
(
    select 
        ID = d.ID,
        CompanyID = c.ID,
        c.CompanyName,
        d.Filename,
        Title = iif(d.Title is NULL, d.Filename, d.Title), 
        Category = d.DocumentCategory, 
        d.UploadDate,
        EsignDate = d.ESignDate,
        d.IsPublishedToEmployee,
        d.IsPrivateDocument,
        EmployeeCode = null,
        EmployeeID = e.ID,
        e.FirstName,
        e.LastName,
        UploadedBy = d.UploadbyUsername
    from
        dbo.Document d
        inner join dbo.Employee e on d.EmployeeID = e.ID
        inner join dbo.Company c on e.CompanyID = c.ID
        inner join dbo.StatusType st on e.CurrentStatusTypeID = st.ID
    where
        st.IndicatesActiveEmployee in (0, 1)
        
),
SignedDocuments as 
(
    select
        ID = d.ID,
        d.CompanyID,
        c.CompanyName,
        d.Title, 
        Filename = right(d.Pointer, charindex('/', reverse(d.Pointer) + '/') - 1),
        d.Category, 
        d.UploadDate,
        EsignDate = null,
        d.IsPublishedToEmployee,
        IsPrivateDocument = null,
        d.EmployeeCode,
        EmployeeID = e.ID,
        e.FirstName,
        e.LastName,
        d.UploadedBy
    from
        dbo.FileMetadata d
        inner join dbo.Employee e on
            e.EmployeeCode = d.EmployeeCode and
            e.CompanyID = d.CompanyID
        inner join dbo.Company c on
            c.ID = d.CompanyID
    union
    select
        ID = f.ID,
        f.CompanyID,
        c.CompanyName,
        f.Title, 
        Filename = right(f.Pointer, charindex('/', reverse(f.Pointer) + '/') - 1),
        f.Category, 
        f.UploadDate,
        EsignDate = null, 
        f.IsPublishedToEmployee,
        IsPrivateDocument = null,
        f.EmployeeCode,
        EmployeeID = null,
        FirstName = null,
        LastName = null,
        f.UploadedBy
    from
        dbo.FileMetadata f
        inner join dbo.Company c on
            c.ID = f.CompanyID
    where
        f.EmployeeCode is null
),
ExcludedCompanies as
(
    select
        ID = CompanyID
    from 
        dbo.HRnextUserCompanyExclude ec
        inner join dbo.HRnextUser u on ec.HRnextUserID = u.ID 
    where
        u.Username = @_user
),
CollatedDocuments as
(
    select
        ID,
        CompanyID,
        CompanyName,
        Title,
        Filename,
        Category,
        UploadDate,
        EsignDate,
        IsLegacyDocument = 1,
        IsPublishedToEmployee,
        IsPrivateDocument,
        EmployeeCode,
        EmployeeID,
        FirstName,
        LastName,
        UploadedBy
    from
        LegacyDocuments
    union 
    select
        ID,
        CompanyID,
        CompanyName,
        Title,
        Filename,
        Category,
        UploadDate,
        EsignDate,
        IsLegacyDocument = 0,
        IsPublishedToEmployee,
        IsPrivateDocument,
        EmployeeCode,
        EmployeeID,
        FirstName,
        LastName,
        UploadedBy
    from
        SignedDocuments
)

insert into @tmp
select * 
from 
    CollatedDocuments
where
    CompanyID not in (select ID from ExcludedCompanies) 
    and 
    (
        lower(Category) like @_search 
        or lower(Title) like @_search 
        or lower(CompanyName) like @_search 
        or lower(EmployeeCode) like @_search
        or lower(FirstName) like @_search
        or lower(LastName) like @_search
    )

-- pagination count
select totalCount = count(*) from @tmp

select 
    id = ID, 
    title = Title, 
    fileName = Filename,
    category = Category, 
    uploadDate = UploadDate,
    esignDate = EsignDate,
    isLegacyDocument = IsLegacyDocument,
    isPublishedToEmployee = IsPublishedToEmployee,
    isPrivateDocument = IsPrivateDocument,
    employeeCode = EmployeeCode,
    companyId = CompanyID,
    companyName = CompanyName,
    employeeId = EmployeeID,
    firstName = FirstName,
    lastName = LastName,
    uploadedBy = UploadedBy
from 
    @tmp
order by uploadDate desc