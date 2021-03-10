-------------------------------------------------------------------------------
--- List All Employees' Documents By Company
--  description:  Collates both legacy documents uploaded and associated 
--                with the employee and documents e-signed by the employee				
-------------------------------------------------------------------------------

declare @_companyId int = @companyId
declare @_search as nvarchar(max) = '%' + @search + '%';
declare @tmp table
(
  	ID nvarchar(max),
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
	EmailAddress nvarchar(max),
	UploadedBy nvarchar(max),
    SignatureStatusName nvarchar(max),
    SignatureStatusPriority int,
    SignatureStatusStepNumber int,
	IsProcessing bit,
    IsHelloSignDocument bit,
    IsOnboarding bit
)

;with EmployeeInfo as 
(
	select 
		ID,
		EmployeeCode,
		CompanyID,
		FirstName,
		LastName,
		EmailAddress
	from
		dbo.Employee
	where
		CompanyID =  @_companyId
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
            EmployeeCode = null,
            EmployeeID = e.ID,
            e.FirstName,
            e.LastName,
			e.EmailAddress,
            d.UploadedBy,
            SignatureStatusName = ss.Name,
            SignatureStatusPriority = ss.Priority,
			SignatureStatusStepNumber = ss.StepNumber,
			IsProcessing = case
				when d.SignatureStatusID = 1 and (select count(*) from dbo.FileMetadata where EsignatureMetadataID = d.ID) = 0 then 1
				else 0
			end,
            IsHelloSignDocument = case
                when d.FileMetadataID is null then 1
                else 0
            end,
            d.IsOnboardingDocument as IsOnboarding
        from
            dbo.EsignatureMetadata d
			inner join EmployeeInfo e on d.EmployeeCode = e.EmployeeCode and d.CompanyID = e.CompanyID 
            inner join dbo.Company c on e.CompanyID = c.ID
            inner join dbo.SignatureStatus ss on ss.ID = d.SignatureStatusID
        where
			d.Type = 'SignatureRequest'
			and (
				d.SignatureStatusID = 2
				or (d.SignatureStatusID = 1 and (select count(*) from dbo.FileMetadata where EsignatureMetadataID = d.ID) = 0)
			)
),

LegacyDocuments as
(
	select 
		ID = d.ID,
		CompanyID = case
                        when d.CompanyID is NULL then c.ID
                        else d.CompanyID
                    end,
		c.CompanyName,
		Title = iif(d.Title is null, d.Filename, d.Title), 
		d.Filename,
		Category = d.DocumentCategory, 
		d.UploadDate,
        EsignDate = d.ESignDate,
		d.IsPublishedToEmployee,
		d.IsPrivateDocument,
		EmployeeCode = null,
		EmployeeID = d.EmployeeID,
		e.FirstName,
		e.LastName,
		e.EmailAddress,
		UploadedBy = d.UploadByUsername,
        SignatureStatusName = (select Name from dbo.SignatureStatus where ID = 3),
        SignatureStatusPriority = (select Priority from dbo.SignatureStatus where ID = 3),
        SignatureStatusStepNumber = (select StepNumber from dbo.SignatureStatus where ID = 3),
        IsHelloSignDocument = 0,
        IsOnboarding = iif(d.UploadByUsername = 'Onboarding', 1, 0)
	from
		dbo.Document d
		inner join EmployeeInfo e on d.EmployeeID = e.ID 
		inner join dbo.Company c on c.ID = e.CompanyID
),

LegacyDocumentPublishedToEmployee as
(
 	select distinct
		ID = d.ID,
		CompanyID = case
                        when d.CompanyID is NULL then c.ID
                        else d.CompanyID
                    end,
		c.CompanyName,
		Title = iif(d.Title is NULL, d.Filename, d.Title), 
		d.Filename,
		Category = d.DocumentCategory, 
		d.UploadDate,
        EsignDate = d.ESignDate,
		d.IsPublishedToEmployee,
		d.IsPrivateDocument,
		EmployeeCode = null,
		EmployeeID = null,
		FirstName = null,
		LastName = null,
		EmailAddress = null,
		UploadedBy = d.UploadbyUsername,
        SignatureStatusName = (select Name from dbo.SignatureStatus where ID = 3),
        SignatureStatusPriority = (select Priority from dbo.SignatureStatus where ID = 3),
        SignatureStatusStepNumber = (select StepNumber from dbo.SignatureStatus where ID = 3),
        IsHelloSignDocument = 0,
        IsOnboarding = iif(d.UploadByUsername = 'Onboarding', 1, 0)
	from
		dbo.Document d
		inner join EmployeeInfo e on d.CompanyID = e.CompanyID
		inner join dbo.Company c on c.ID = e.CompanyID
	where
		d.IsPublishedToEmployee = 1
),

SignedDocuments as 
(
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
		EmployeeID = e.ID,
		e.FirstName,
		e.LastName,
		e.EmailAddress,
		f.UploadedBy,
		SignatureStatusName = s.Name,
		SignatureStatusPriority = s.Priority,
        SignatureStatusStepNumber = s.StepNumber,
        IsHelloSignDocument = 0,
        em.IsOnboardingDocument as IsOnboarding
	from
		dbo.FileMetadata f
        inner join EmployeeInfo e on 
            f.CompanyID = e.CompanyID 
            and f.EmployeeCode = e.EmployeeCode
		inner join dbo.Company c on
			c.ID = e.CompanyID
        inner join dbo.EsignatureMetadata em on
            em.ID = f.EsignatureMetadataID
        inner join dbo.SignatureStatus s on
            s.ID = em.SignatureStatusID
    where
		f.IsPublishedToEmployee <> 1 or f.IsPublishedToEmployee is null	
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
		EmployeeID = e.ID,
		e.FirstName,
		e.LastName,
		e.EmailAddress,
		f.UploadedBy,
		SignatureStatusName = s.Name,
		SignatureStatusPriority = s.Priority,
        SignatureStatusStepNumber = s.StepNumber,
        IsHelloSignDocument = 0,
        em.IsOnboardingDocument as IsOnboarding
	from
		dbo.FileMetadata f
        inner join EmployeeInfo e on 
            f.CompanyID = e.CompanyID 
            and f.EmployeeCode = e.EmployeeCode
		inner join dbo.Company c on
			c.ID = e.CompanyID
        inner join dbo.EsignatureMetadata em on
            em.ID = f.EsignatureMetadataID
        inner join dbo.SignatureStatus s on
            s.ID = em.SignatureStatusID
    where
		f.IsPublishedToEmployee = 1
),
UploadedDocuments as 
(
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
		EmployeeID = e.ID,
		e.FirstName,
		e.LastName,
		e.EmailAddress,
		f.UploadedBy,
		SignatureStatusName = (select Name from dbo.SignatureStatus where ID = 3),
        SignatureStatusPriority = (select Priority from dbo.SignatureStatus where ID = 3),
        SignatureStatusStepNumber = (select StepNumber from dbo.SignatureStatus where ID = 3),
        IsHelloSignDocument = 0,
        em.IsOnboardingDocument as IsOnboarding
	from
		dbo.FileMetadata f
        inner join EmployeeInfo e on 
            f.CompanyID = e.CompanyID 
            and f.EmployeeCode = e.EmployeeCode
		inner join dbo.Company c on
			c.ID = e.CompanyID
		inner join dbo.EsignatureMetadata em on
            em.ID = f.EsignatureMetadataID
    where
		(f.IsPublishedToEmployee <> 1 or f.IsPublishedToEmployee is null)
		and f.EsignatureMetadataID is null
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
		EmployeeID = e.ID,
		e.FirstName,
		e.LastName,
		e.EmailAddress,
		f.UploadedBy,
		SignatureStatusName = (select Name from dbo.SignatureStatus where ID = 3),
        SignatureStatusPriority = (select Priority from dbo.SignatureStatus where ID = 3),
        SignatureStatusStepNumber = (select StepNumber from dbo.SignatureStatus where ID = 3),
        IsHelloSignDocument = 0,
        em.IsOnboardingDocument as IsOnboarding
	from
		dbo.FileMetadata f
        inner join EmployeeInfo e on 
            f.CompanyID = e.CompanyID 
            and f.EmployeeCode = e.EmployeeCode
		inner join dbo.Company c on
			c.ID = e.CompanyID
		inner join dbo.EsignatureMetadata em on
            em.ID = f.EsignatureMetadataID
    where
		f.IsPublishedToEmployee = 1
		and f.EsignatureMetadataID is null
),

NewDocumentPublishedToEmployee as 
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
		EmployeeID = null,
		FirstName = null,
		LastName = null,
		EmailAddress = null,
		d.UploadedBy,
		SignatureStatusName = (select Name from dbo.SignatureStatus where ID = 3),
		SignatureStatusPriority = (select Priority from dbo.SignatureStatus where ID = 3),
        SignatureStatusStepNumber = (select StepNumber from dbo.SignatureStatus where ID = 3),
        IsHelloSignDocument = 0,
        em.IsOnboardingDocument as IsOnboarding
	from
		dbo.FileMetadata d
		inner join EmployeeInfo e on 
			d.CompanyID = e.CompanyID
		inner join dbo.Company c on
			c.ID = e.CompanyID
		inner join dbo.EsignatureMetadata em on
            em.ID = d.EsignatureMetadataID
	where
		d.IsPublishedToEmployee = 1 and
        d.EmployeeCode is null
),

CollatedDocuments as
(
	select ID, CompanyID, CompanyName, Title, Filename, Category, UploadDate, EsignDate, IsLegacyDocument = 0, IsEsignatureDocument = 1, IsSignedOrUploadedDocument = 0, IsPublishedToEmployee, IsPrivateDocument, EmployeeCode, EmployeeID, FirstName, LastName, EmailAddress, UploadedBy, SignatureStatusName, SignatureStatusPriority, SignatureStatusStepNumber, IsProcessing, IsHelloSignDocument, IsOnboarding from SignatureRequests
    union
	select cast(ID as nvarchar) as ID, CompanyID, CompanyName, Title, Filename, Category, UploadDate, EsignDate, IsLegacyDocument = 1, IsEsignatureDocument = 0, IsSignedOrUploadedDocument = 0, IsPublishedToEmployee, IsPrivateDocument, EmployeeCode, EmployeeID, FirstName, LastName, EmailAddress, UploadedBy, SignatureStatusName, SignatureStatusPriority, SignatureStatusStepNumber, IsProcessing = 0, IsHelloSignDocument, IsOnboarding from LegacyDocumentPublishedToEmployee
	union
	select cast(ID as nvarchar) as ID, CompanyID, CompanyName, Title, Filename, Category, UploadDate, EsignDate, IsLegacyDocument = 1, IsEsignatureDocument = 0, IsSignedOrUploadedDocument = 0, IsPublishedToEmployee, IsPrivateDocument, EmployeeCode, EmployeeID, FirstName, LastName, EmailAddress, UploadedBy, SignatureStatusName, SignatureStatusPriority, SignatureStatusStepNumber, IsProcessing = 0, IsHelloSignDocument, IsOnboarding from LegacyDocuments
	union 
	select cast(ID as nvarchar) as ID, CompanyID, CompanyName, Title, Filename, Category, UploadDate, EsignDate, IsLegacyDocument = 0, IsEsignatureDocument = 0, IsSignedOrUploadedDocument = 1, IsPublishedToEmployee, IsPrivateDocument, EmployeeCode, EmployeeID, FirstName, LastName, EmailAddress, UploadedBy, SignatureStatusName, SignatureStatusPriority, SignatureStatusStepNumber, IsProcessing = 0, IsHelloSignDocument, IsOnboarding from SignedDocuments
    union
	select cast(ID as nvarchar) as ID, CompanyID, CompanyName, Title, Filename, Category, UploadDate, EsignDate, IsLegacyDocument = 0, IsEsignatureDocument = 0, IsSignedOrUploadedDocument = 1, IsPublishedToEmployee, IsPrivateDocument, EmployeeCode, EmployeeID, FirstName, LastName, EmailAddress, UploadedBy, SignatureStatusName, SignatureStatusPriority, SignatureStatusStepNumber, IsProcessing = 0, IsHelloSignDocument, IsOnboarding from UploadedDocuments
    union
	select cast(ID as nvarchar) as ID, CompanyID, CompanyName, Title, Filename, Category, UploadDate, EsignDate, IsLegacyDocument = 0, IsEsignatureDocument = 0, IsSignedOrUploadedDocument = 1, IsPublishedToEmployee, IsPrivateDocument, EmployeeCode, EmployeeID, FirstName, LastName, EmailAddress, UploadedBy, SignatureStatusName, SignatureStatusPriority, SignatureStatusStepNumber, IsProcessing = 0, IsHelloSignDocument, IsOnboarding from NewDocumentPublishedToEmployee
)

insert into @tmp
select * from CollatedDocuments
where 
	lower(isnull(Category, '')) like @_search 
	or lower(isnull(Title, '')) like @_search 
	or lower(isnull(CompanyName, '')) like @_search 
	or lower(isnull(EmployeeCode, '')) like @_search
	or lower(concat(FirstName, LastName, FirstName)) like @_search
    or lower(isnull(SignatureStatusName, '')) like @_search

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
	employeeId = EmployeeID,
	companyName = CompanyName,
	firstName = FirstName,
	lastName = LastName,
	emailAddress = EmailAddress,
	uploadedBy = UploadedBy,
    signatureStatusName = SignatureStatusName,
    signatureStatusPriority = SignatureStatusPriority,
    signatureStatusStepNumber = SignatureStatusStepNumber,
	isProcessing = IsProcessing,
    isHelloSignDocument = IsHelloSignDocument,
	isOnboarding = IsOnboarding
from 
	@tmp
order by uploadDate desc
