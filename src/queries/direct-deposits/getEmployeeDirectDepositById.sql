select
    *
from
    dbo.EmployeeDirectDeposit
where
    ID = @id and
    EmployeeID = @employeeId