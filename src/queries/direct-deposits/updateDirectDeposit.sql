declare @_amountType nvarchar(40) = '@amountType'

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
where
    ID = @id