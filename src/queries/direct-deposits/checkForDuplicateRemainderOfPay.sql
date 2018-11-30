select 
    DuplicateType = 'remainder',
    * 
from
    dbo.EmployeeDirectDeposit 
where
    EmployeeID = @employeeId and
    AmountCode = 'Balance Remainder'