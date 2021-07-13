select
    ee.ID,
    ee.CompanyID,
    ee.EmployeeCode,
    ee.FirstName,
    ee.LastName,
	pt.IsSalary
from
    dbo.Employee ee
left join dbo.EmployeeCompensation ec on ec.EmployeeID = ee.ID
left join dbo.PayType pt on pt.ID = ec.PayTypeID
where
    ee.ID = @employeeId