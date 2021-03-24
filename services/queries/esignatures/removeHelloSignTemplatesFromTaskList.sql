declare
    @taskStepId int = 5,
    @taskListId int,
    @_companyId int = @companyId;
declare @tmp table (
    docId nvarchar(max)
);

declare cursor_tasklist cursor
for select
        ID
    from
        dbo.OnboardingTaskList
    where
        CompanyID = @_companyId

open cursor_tasklist;

fetch next from cursor_tasklist into @taskListId;

while @@fetch_status = 0
    begin
        delete from @tmp
        declare @taskListIds nvarchar(max) = (select CompanyDoc_CompanyDocKeys from dbo.OnboardingTaskStep where OnboardingTaskStepTypeID = @taskStepId and OnboardingTaskListID = @taskListId)
        insert into @tmp select value from string_split(@taskListIds, ',');
        with Documents as (
        select ID, Type from dbo.EsignatureMetadata
        union select cast(ID as nvarchar) as ID, Type = 'Legacy' from dbo.Document)

        UPDATE dbo.OnboardingTaskStep set CompanyDoc_CompanyDocKeys = STUFF((
                SELECT ',' + ID
                    FROM Documents
                    where ID in (select docId from @tmp) and Type <> 'Template'
                    FOR XML PATH('')
                ), 1, 1, '')
        where OnboardingTaskStepTypeID = @taskStepId and OnboardingTaskListID = @taskListId
        fetch next from cursor_tasklist into @taskListId
    end

close cursor_tasklist;
deallocate cursor_tasklist;
