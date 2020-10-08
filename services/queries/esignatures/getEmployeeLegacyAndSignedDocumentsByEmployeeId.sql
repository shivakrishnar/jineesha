-------------------------------------------------------------------------------
--- List Employee's Documents
--  description:  Collates both legacy documents uploaded and associated 
--                with the employee and documents e-signed by the employee					
-------------------------------------------------------------------------------

declare @_employeeId int = @employeeId
declare @_includePrivateDocuments bit = @includePrivateDocuments
declare @_invokerUsername varchar(max) = @invokerUsername
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
	UploadedBy nvarchar(max),
	SignatureStatusName nvarchar(max),
    SignatureStatusPriority int,
    SignatureStatusStepNumber int,
	IsProcessing bit
)

-- Restriction to prevent users with administrative privileges from viewing their own Private documentation
select 
    @_includePrivateDocuments = @_includePrivateDocuments & iif(ue.EmployeeID = @_employeeId, 0, 1)
from 
    dbo.HRnextUser hru
    inner join dbo.HRnextUserEmployee ue on hru.ID = ue.HRnextUserID
where 
    Username = @_invokerUsername
    and ue.EmployeeID = @_employeeId

;with EmployeeInfo as 
(
	select 
		ID,
		EmployeeCode,
		CompanyID,
		FirstName,
		LastName
	from
		dbo.Employee
	where
		ID = @_employeeId
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
						when d.CompanyID is null then c.ID
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
		EmployeeID = d.EmployeeID,
		e.FirstName,
		e.LastName,
		UploadedBy = d.UploadByUsername,
        SignatureStatusName = (select Name from dbo.SignatureStatus where ID = 3),
        SignatureStatusPriority = (select Priority from dbo.SignatureStatus where ID = 3),
        SignatureStatusStepNumber = (select StepNumber from dbo.SignatureStatus where ID = 3)
	from
		dbo.Document d
		inner join EmployeeInfo e on d.EmployeeID = e.ID
		inner join dbo.Company c on c.ID = e.CompanyID
	except
		select 
			ID = d.ID,
			CompanyID = case
							when d.CompanyID is null then c.ID
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
			EmployeeID = d.EmployeeID,
			e.FirstName,
			e.LastName,
			UploadedBy = d.UploadByUsername,
			SignatureStatusName = (select Name from dbo.SignatureStatus where ID = 3),
			SignatureStatusPriority = (select Priority from dbo.SignatureStatus where ID = 3),
        	SignatureStatusStepNumber = (select StepNumber from dbo.SignatureStatus where ID = 3)
		from
			dbo.Document d
			inner join EmployeeInfo e on d.EmployeeID = e.ID
			inner join dbo.Company c on c.ID = e.CompanyID
		where
			d.IsPrivateDocument = 1
			and @_includePrivateDocuments <> 1
),
LegacyDocumentPublishedToEmployee as
(
 	select distinct
		ID = d.ID,
		d.CompanyID,
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
		UploadedBy = d.UploadByUsername,
        SignatureStatusName = (select Name from dbo.SignatureStatus where ID = 3),
        SignatureStatusPriority = (select Priority from dbo.SignatureStatus where ID = 3),
        SignatureStatusStepNumber = (select StepNumber from dbo.SignatureStatus where ID = 3)
	from
		dbo.Document d
		inner join EmployeeInfo e on d.CompanyID = e.CompanyID
		inner join dbo.Company c on c.ID = e.CompanyID
	where
		d.IsPublishedToEmployee = 1
),
UploadedPrivateDocuments as 
(
	select distinct
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
		inner join EmployeeInfo e on 
			d.CompanyID = e.CompanyID
			and d.EmployeeCode = e.EmployeeCode
		inner join dbo.Company c on
			c.ID = e.CompanyID
	where
		d.IsPublishedToEmployee = 0
        and @_includePrivateDocuments <> 0
),
SignedDocuments as 
(
	select distinct
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
		inner join EmployeeInfo e on 
			d.CompanyID = e.CompanyID
			and d.EmployeeCode = e.EmployeeCode
		inner join dbo.Company c on
			c.ID = e.CompanyID
        inner join dbo.EsignatureMetadata em on
            em.ID = d.EsignatureMetadataID
        inner join dbo.SignatureStatus s on
            s.ID = em.SignatureStatusID
	where
		d.IsPublishedToEmployee <> 0 or d.IsPublishedToEmployee is null
),
UploadedDocuments as 
(
	select distinct
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
		inner join EmployeeInfo e on 
			d.CompanyID = e.CompanyID
			and d.EmployeeCode = e.EmployeeCode
		inner join dbo.Company c on
			c.ID = e.CompanyID
	where
		(d.IsPublishedToEmployee <> 0 or d.IsPublishedToEmployee is null)
		and d.EsignatureMetadataID is null
),

NewDocumentPublishedToEmployee as 
(
	select distinct
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
		e.FirstName,
		e.LastName,
		d.UploadedBy,
		SignatureStatusName = (select Name from dbo.SignatureStatus where ID = 3),
		SignatureStatusPriority = (select Priority from dbo.SignatureStatus where ID = 3),
        SignatureStatusStepNumber = (select StepNumber from dbo.SignatureStatus where ID = 3)
	from
		dbo.FileMetadata d
		inner join EmployeeInfo e on 
			d.CompanyID = e.CompanyID
		inner join dbo.Company c on
			c.ID = e.CompanyID
	where
		d.IsPublishedToEmployee = 1 and d.EmployeeCode is null
),

CollatedDocuments as
(
	select ID, CompanyID, CompanyName, Title, Filename, Category, UploadDate, EsignDate, IsLegacyDocument = 0, IsEsignatureDocument = 1, IsSignedOrUploadedDocument = 0, IsPublishedToEmployee, IsPrivateDocument, EmployeeCode, EmployeeID, FirstName, LastName, UploadedBy, SignatureStatusName, SignatureStatusPriority, SignatureStatusStepNumber, IsProcessing from SignatureRequests
	union
    select cast(ID as nvarchar) as ID, CompanyID, CompanyName, Title, Filename, Category, UploadDate, EsignDate, IsLegacyDocument = 1, IsEsignatureDocument = 0, IsSignedOrUploadedDocument = 0, IsPublishedToEmployee, IsPrivateDocument, EmployeeCode, EmployeeID, FirstName, LastName, UploadedBy, SignatureStatusName, SignatureStatusPriority, SignatureStatusStepNumber, IsProcessing = 0 from LegacyDocumentPublishedToEmployee
    union
	select cast(ID as nvarchar) as ID, CompanyID, CompanyName, Title, Filename, Category, UploadDate, EsignDate, IsLegacyDocument = 1, IsEsignatureDocument = 0, IsSignedOrUploadedDocument = 0, IsPublishedToEmployee, IsPrivateDocument, EmployeeCode, EmployeeID, FirstName, LastName, UploadedBy, SignatureStatusName, SignatureStatusPriority, SignatureStatusStepNumber, IsProcessing = 0 from LegacyDocuments
	union 
	select cast(ID as nvarchar) as ID, CompanyID, CompanyName, Title, Filename, Category, UploadDate, EsignDate, IsLegacyDocument = 0, IsEsignatureDocument = 0, IsSignedOrUploadedDocument = 1, IsPublishedToEmployee, IsPrivateDocument, EmployeeCode, EmployeeID, FirstName, LastName, UploadedBy, SignatureStatusName, SignatureStatusPriority, SignatureStatusStepNumber, IsProcessing = 0 from SignedDocuments
	union
	select cast(ID as nvarchar) as ID, CompanyID, CompanyName, Title, Filename, Category, UploadDate, EsignDate, IsLegacyDocument = 0, IsEsignatureDocument = 0, IsSignedOrUploadedDocument = 1, IsPublishedToEmployee, IsPrivateDocument, EmployeeCode, EmployeeID, FirstName, LastName, UploadedBy, SignatureStatusName, SignatureStatusPriority, SignatureStatusStepNumber, IsProcessing = 0 from UploadedDocuments
	union
	select cast(ID as nvarchar) as ID, CompanyID, CompanyName, Title, Filename, Category, UploadDate, EsignDate, IsLegacyDocument = 0, IsEsignatureDocument = 0, IsSignedOrUploadedDocument = 1, IsPublishedToEmployee, IsPrivateDocument, EmployeeCode, EmployeeID, FirstName, LastName, UploadedBy, SignatureStatusName, SignatureStatusPriority, SignatureStatusStepNumber, IsProcessing = 0 from NewDocumentPublishedToEmployee
    union 
    select cast(ID as nvarchar) as ID, CompanyID, CompanyName, Title, Filename, Category, UploadDate, EsignDate, IsLegacyDocument = 0, IsEsignatureDocument = 0, IsSignedOrUploadedDocument = 1, IsPublishedToEmployee, IsPrivateDocument, EmployeeCode, EmployeeID, FirstName, LastName, UploadedBy, SignatureStatusName, SignatureStatusPriority, SignatureStatusStepNumber, IsProcessing = 0 from UploadedPrivateDocuments
)

insert into @tmp
select * from CollatedDocuments
where
	lower(isnull(Category, '')) like @_search 
	or lower(isnull(Title, '')) like @_search 
	or lower(isnull(CompanyName, '')) like @_search 
	or lower(isnull(EmployeeCode, '')) like @_search
    or concat(FirstName, LastName, FirstName) like @_search
	or lower(isnull(SignatureStatusName, '')) like @_search
	
-- pagination count
select totalCount = count(*) from @tmp

select 
	id = ID, 
	companyId = CompanyID,
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
	employeeId = EmployeeID,
	companyName = CompanyName,
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

