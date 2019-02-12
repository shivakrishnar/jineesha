select 
    DuplicateType = 'accounts',
    * 
from
    dbo.EmployeeDirectDeposit 
where
    RoutingNumber = '@routingNumber' and
    Account = '@accountNumber' and
    @designationColumnName = 1 and
    EmployeeID = @employeeId
