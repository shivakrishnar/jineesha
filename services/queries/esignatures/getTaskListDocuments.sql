

declare @documentIdCollection varchar(max)

declare @tmp table
(
    DocumentID nvarchar(max)
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

-- Get total results for pagination
select count(*) as totalCount from @tmp where isnumeric(DocumentID) <> 1

;with OriginalDocuments
as 
(
	select
	    ID,
		Filename,
		Title,
		Description
	from
		dbo.Document
	where
	    CompanyID = @companyId
		and ID in (select
					DocumentID
				from 
					@tmp
				where
					isnumeric(DocumentID) = 1 )
		
)

select cast(ID as varchar(max)) as ID, Filename, Title, Description from OriginalDocuments
union
select ID = DocumentID, Filename = DocumentID, null, null from @tmp where isnumeric(DocumentID) <> 1
order by ID





