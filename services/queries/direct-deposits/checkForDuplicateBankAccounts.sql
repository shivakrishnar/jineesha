select 
    DuplicateType = 'accounts',
    * 
from
    dbo.EmployeeDirectDeposit 
where
    RoutingNumber = '@routingNumber' and
    (Account = '@accountNumber' OR  Account = '@tokenizedAccountNumber') and
    EmployeeID = @employeeId
