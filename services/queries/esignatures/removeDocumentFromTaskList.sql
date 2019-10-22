declare @_documentId as nvarchar(max) = '@documentId';
declare
    @taskStepId int,
    @docKeys nvarchar(max),
    @updatedDocKeys nvarchar(max);
declare @tmp table (
    docId nvarchar(max)
);

declare cursor_taskstep cursor
for select
        ID,
        CompanyDoc_CompanyDocKeys
    from
        dbo.OnboardingTaskStep
    where
        @_documentId in (select value from string_split(CompanyDoc_CompanyDocKeys, ','));

open cursor_taskstep;

fetch next from cursor_taskstep into @taskStepId, @docKeys;

while @@fetch_status = 0
    begin
        set @updatedDocKeys = null
        delete from @tmp

        insert into @tmp select value from string_split(@docKeys, ',')
        delete from @tmp where docId = @_documentId
        select @updatedDocKeys = coalesce(@updatedDocKeys + ',', '') + docId from @tmp
        update dbo.OnboardingTaskStep set CompanyDoc_CompanyDocKeys = @updatedDocKeys where ID = @taskStepId
        fetch next from cursor_taskstep into @taskStepId, @docKeys
    end

close cursor_taskstep;
deallocate cursor_taskstep;
