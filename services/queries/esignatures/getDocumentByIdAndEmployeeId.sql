select
    *
from
    dbo.Document
where
    ID = @id and
    EmployeeID = @employeeId