select count(*) as Total 
from Employee 
where EmployeeCode = @NewEmployeeCode and 
      CompanyID = @CompanyId