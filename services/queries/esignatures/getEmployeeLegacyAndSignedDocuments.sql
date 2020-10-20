-------------------------------------------------------------------------------
--- List All Employees' Documents 
--  description:  Collates legacy documents uploaded and associated 
--                with the employee, documents pending e-signature from the
--                employee, and documents e-signed by the employee
-------------------------------------------------------------------------------

declare @_user nvarchar(max) = '@user'
declare @_search as nvarchar(max) = '%' + @search + '%';

declare @tmp table
(
    ID  nvarchar(max),
    CompanyID int,
    CompanyName nvarchar(max), 
    Title nvarchar(max),
    Filename nvarchar(max),
    Category nvarchar(max),
    UploadDate datetime2(3),
    EsignDate datetime2(3),
    IsLegacyDocument bit,
    IsEsignatureDocument bit,
    IsSignedOrUploadedDocument bit,
    IsPublishedToEmployee bit,
    IsPrivateDocument bit,
    EmployeeCode nvarchar(max),
    EmployeeID int,
    FirstName nvarchar(max),
    LastName nvarchar(max),
    UploadedBy nvarchar(max),
    SignatureStatusName nvarchar(max),
    SignatureStatusPriority int,
    SignatureStatusStepNumber int,
    IsProcessing bit
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
        UploadedBy = d.UploadbyUsername,
        SignatureStatusName = (select Name from dbo.SignatureStatus where ID = 3),
        SignatureStatusPriority = (select Priority from dbo.SignatureStatus where ID = 3),
        SignatureStatusStepNumber = (select StepNumber from dbo.SignatureStatus where ID = 3)
    from
        dbo.Document d
        inner join dbo.Employee e on d.EmployeeID = e.ID
        inner join dbo.Company c on e.CompanyID = c.ID
        inner join dbo.StatusType st on e.CurrentStatusTypeID = st.ID
    where
        st.IndicatesActiveEmployee in (0, 1)
        
),
SignatureRequests as
(
    select 
            ID = d.ID,
            CompanyID = c.ID,
            c.CompanyName,
            d.Filename,
            Title = iif(d.Title is NULL, d.Filename, d.Title), 
            Category = d.Category, 
            d.UploadDate,
            EsignDate = null,
            IsPublishedToEmployee=1,
            IsPrivateDocument=null,
            EmployeeCode = e.EmployeeCode,
            EmployeeID = e.ID,
            e.FirstName,
            e.LastName,
            d.UploadedBy,
            SignatureStatusName = ss.Name,
            SignatureStatusPriority = ss.Priority,
            SignatureStatusStepNumber = ss.StepNumber,
            IsProcessing = case
				when d.SignatureStatusID = 1 and (select count(*) from dbo.FileMetadata where EsignatureMetadataID = d.ID) = 0 then 1
				else 0
			end
        from
            dbo.EsignatureMetadata d
            left join dbo.Employee e on d.EmployeeCode = e.EmployeeCode and d.CompanyID = e.CompanyID
            inner join dbo.Company c on d.CompanyID = c.ID
            inner join dbo.StatusType st on e.CurrentStatusTypeID = st.ID
            inner join dbo.SignatureStatus ss on ss.ID = d.SignatureStatusID
        where
            st.IndicatesActiveEmployee in (0, 1)
            and d.Type = 'SignatureRequest'
            and (
				d.SignatureStatusID = 2
				or (d.SignatureStatusID = 1 and (select count(*) from dbo.FileMetadata where EsignatureMetadataID = d.ID) = 0)
			)
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
        d.UploadedBy,
        SignatureStatusName = s.Name,
        SignatureStatusPriority = s.Priority,
        SignatureStatusStepNumber = s.StepNumber
    from
        dbo.FileMetadata d
        inner join dbo.Employee e on
            e.EmployeeCode = d.EmployeeCode and
            e.CompanyID = d.CompanyID
        inner join dbo.Company c on
            c.ID = d.CompanyID
        inner join dbo.EsignatureMetadata em on
            em.ID = d.EsignatureMetadataID
        inner join dbo.SignatureStatus s on
            s.ID = em.SignatureStatusID
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
        f.UploadedBy,
        SignatureStatusName = s.Name,
        SignatureStatusPriority = s.Priority,
        SignatureStatusStepNumber = s.StepNumber
    from
        dbo.FileMetadata f
        inner join dbo.Company c on
            c.ID = f.CompanyID
        inner join dbo.EsignatureMetadata em on
            em.ID = f.EsignatureMetadataID
        inner join dbo.SignatureStatus s on
            s.ID = em.SignatureStatusID
    where
        f.EmployeeCode is null
),
UploadedDocuments as 
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
        d.UploadedBy,
        SignatureStatusName = (select Name from dbo.SignatureStatus where ID = 3),
        SignatureStatusPriority = (select Priority from dbo.SignatureStatus where ID = 3),
        SignatureStatusStepNumber = (select StepNumber from dbo.SignatureStatus where ID = 3)
    from
        dbo.FileMetadata d
        inner join dbo.Employee e on
            e.EmployeeCode = d.EmployeeCode and
            e.CompanyID = d.CompanyID
        inner join dbo.Company c on
            c.ID = d.CompanyID
    where
        d.EsignatureMetadataID is null
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
        f.UploadedBy,
        SignatureStatusName = (select Name from dbo.SignatureStatus where ID = 3),
        SignatureStatusPriority = (select Priority from dbo.SignatureStatus where ID = 3),
        SignatureStatusStepNumber = (select StepNumber from dbo.SignatureStatus where ID = 3)
    from
        dbo.FileMetadata f
        inner join dbo.Company c on
            c.ID = f.CompanyID
    where
        f.EmployeeCode is null
        and f.EsignatureMetadataID is null
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
        cast(ID as nvarchar) as ID,
        CompanyID,
        CompanyName,
        Title,
        Filename,
        Category,
        UploadDate,
        EsignDate,
        IsLegacyDocument = 1,
        IsEsignatureDocument = 0,
        IsSignedOrUploadedDocument = 0,
        IsPublishedToEmployee,
        IsPrivateDocument,
        EmployeeCode,
        EmployeeID,
        FirstName,
        LastName,
        UploadedBy,
        SignatureStatusName,
        SignatureStatusPriority,
        SignatureStatusStepNumber,
        IsProcessing = 0
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
        IsEsignatureDocument = 1,
        IsSignedOrUploadedDocument = 0,
        IsPublishedToEmployee,
        IsPrivateDocument,
        EmployeeCode,
        EmployeeID,
        FirstName,
        LastName,
        UploadedBy,
        SignatureStatusName,
        SignatureStatusPriority,
        SignatureStatusStepNumber,
        IsProcessing
    from
        SignatureRequests
    union 
    select
        cast(ID as nvarchar) as ID,
        CompanyID,
        CompanyName,
        Title,
        Filename,
        Category,
        UploadDate,
        EsignDate,
        IsLegacyDocument = 0,
        IsEsignatureDocument = 0,
        IsSignedOrUploadedDocument = 1,
        IsPublishedToEmployee,
        IsPrivateDocument,
        EmployeeCode,
        EmployeeID,
        FirstName,
        LastName,
        UploadedBy,
        SignatureStatusName,
        SignatureStatusPriority,
        SignatureStatusStepNumber,
        IsProcessing = 0
    from
        SignedDocuments
    union
    select
        cast(ID as nvarchar) as ID,
        CompanyID,
        CompanyName,
        Title,
        Filename,
        Category,
        UploadDate,
        EsignDate,
        IsLegacyDocument = 0,
        IsEsignatureDocument = 0,
        IsSignedOrUploadedDocument = 1,
        IsPublishedToEmployee,
        IsPrivateDocument,
        EmployeeCode,
        EmployeeID,
        FirstName,
        LastName,
        UploadedBy,
        SignatureStatusName,
        SignatureStatusPriority,
        SignatureStatusStepNumber,
        IsProcessing = 0
    from
        UploadedDocuments
)

insert into @tmp
select * 
from 
    CollatedDocuments
where
    CompanyID not in (select ID from ExcludedCompanies) 
    and 
    (
        lower(isnull(Category, '')) like @_search 
        or lower(isnull(Title, '')) like @_search 
        or lower(isnull(CompanyName, '')) like @_search 
        or lower(isnull(EmployeeCode, '')) like @_search
        or lower(concat(FirstName, LastName, FirstName)) like @_search
        or lower(isnull(SignatureStatusName, '')) like @_search
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
    isEsignatureDocument = IsEsignatureDocument,
    isSignedOrUploadedDocument = IsSignedOrUploadedDocument,
    isPublishedToEmployee = IsPublishedToEmployee,
    isPrivateDocument = IsPrivateDocument,
    employeeCode = EmployeeCode,
    companyId = CompanyID,
    companyName = CompanyName,
    employeeId = EmployeeID,
    firstName = FirstName,
    lastName = LastName,
    uploadedBy = UploadedBy,
    signatureStatusName = SignatureStatusName,
    signatureStatusPriority = SignatureStatusPriority,
    signatureStatusStepNumber = SignatureStatusStepNumber,
    isProcessing = IsProcessing
from 
    @tmp
order by uploadDate desc