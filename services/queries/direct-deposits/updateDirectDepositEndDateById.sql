declare @tmp table(
    oldEndDate nvarchar(max),
    newEndDate nvarchar(max)
)

update
    dbo.EmployeeDirectDeposit
set
    EndDate = convert(date, getdate())
output
    deleted.EndDate as oldEndDate,
    inserted.EndDate as newEndDate
    into
        @tmp
where
    ID = @directDepositId

select oldEndDate as EndDate from @tmp
select newEndDate as EndDate from @tmp