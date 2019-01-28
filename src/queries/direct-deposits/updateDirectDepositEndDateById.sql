update
    dbo.EmployeeDirectDeposit
set
    EndDate = convert(date, getdate())
where
    ID = @directDepositId