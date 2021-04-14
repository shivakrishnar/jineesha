declare @documentIdCollection varchar(max)
declare @_companyId int = @companyId

declare @tmp table
(
    DocumentID nvarchar(max)
)

declare @tmpResults table
(
	ID nvarchar(max),
	Filename nvarchar(max),
	Title nvarchar(max),
	Description nvarchar(max),
	Type nvarchar(max),
	FileMetadataID int,
	Pointer nvarchar(max)
)

declare onboarding_documents_cursor cursor for

with OnboardingDocuments 
as 
(
	select 
		DocumentIDCollection = CompanyDoc_CompanyDocKeys
	from
		dbo.OnboardingTaskStep
	where
		OnboardingTaskListID = @taskListId
		and CompanyDoc_CompanyDocKeys is not null
)

select 
	DocumentIDCollection
from
	OnboardingDocuments

open onboarding_documents_cursor
fetch next from onboarding_documents_cursor
into @documentIdCollection

while @@fetch_status = 0
begin
	insert into @tmp(DocumentID)
	select value from string_split(@documentIdCollection, ',') 

	fetch next from onboarding_documents_cursor
	into @documentIdCollection
end

close onboarding_documents_cursor
deallocate onboarding_documents_cursor

;with OriginalDocuments
as 
(
	select
	    ID,
		Filename,
		Title,
		Description,
		null as Type,
		null as FileMetadataID,
		Pointer
	from
		dbo.Document
	where
	    CompanyID = @_companyId
		and ID in (select
					DocumentID
				from 
					@tmp
				where
					isnumeric(DocumentID) = 1 )
		
), 
HelloSignTemplates
as 
(
	select
	    ID,
		Filename,
		Title,
		null as Description,
		Type,
	    null as FileMetadataID,
		null as Pointer
	from
		dbo.EsignatureMetadata
	where
	    CompanyID = @_companyId
		and ID in (select
					DocumentID
				from 
					@tmp
				where
					isnumeric(DocumentID) <> 1 )
        and Type = 'Template'		
),
OtherDocuments
as 
(
	select
	    e.ID,
		e.Filename,
		e.Title,
		null as Description,
		e.Type,
		f.ID as FileMetadataID,
		f.Pointer
	from
		dbo.EsignatureMetadata e
	join dbo.FileMetadata f on f.EsignatureMetadataID = e.ID
	where
	    e.CompanyID = @_companyId
		and e.ID in (select
					DocumentID
				from 
					@tmp
				where
					isnumeric(DocumentID) <> 1 )	
        and Type in ('NoSignature', 'SimpleSignatureRequest')
)

Insert into @tmpResults
select cast(ID as varchar(max)) as ID, Filename, Title, Description, Type, FileMetadataID, Pointer from OriginalDocuments
union
select cast(ID as varchar(max)) as ID, Filename, Title, Description, Type, FileMetadataID, Pointer from HelloSignTemplates
union
select cast(ID as varchar(max)) as ID, Filename, Title, Description, Type, FileMetadataID, Pointer from OtherDocuments

-- Get total results for pagination
select count(*) as totalCount from @tmpResults
select * from @tmpResults
order by ID
