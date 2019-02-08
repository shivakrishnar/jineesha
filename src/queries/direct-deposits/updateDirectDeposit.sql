declare @_amountType nvarchar(40) = '@amountType'
declare @tmp table(
    oldAmount int,
    oldAmountCode nvarchar(max),
    newAmount int,
    newAmountCode nvarchar(max)
)

update
    dbo.EmployeeDirectDeposit
set
    AmountCode = case
                    when (@_amountType = 'Percentage') then '%'
                    when (@_amountType = 'Flat') then 'Flat'
                    else 'Balance Remainder'
                end,
    Amount = case
                when (@_amountType = 'Balance Remainder') then null
                else @amount
            end
output
    deleted.Amount as oldAmount,
    deleted.AmountCode as oldAmountCode,
    inserted.Amount as newAmount,
    inserted.AmountCode as newAmountCode
    into
        @tmp
where
    ID = @id

-- Get old and new values for auditing
select oldAmount as Amount, oldAmountCode as AmountCode from @tmp
select newAmount as Amount, newAmountCode as AmountCode from @tmp