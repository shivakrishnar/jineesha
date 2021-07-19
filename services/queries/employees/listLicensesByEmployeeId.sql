declare @_employeeId as int = @employeeId

-- Get total count for pagination
select count(*) as totalCount from EmployeeLicense as el
left join LicenseType as lt
on el.LicenseTypeID = lt.ID
where EmployeeID = @_employeeId

select el.*, lt.CompanyID, lt.Code, lt.Description, lt.Priority, lt.Active from EmployeeLicense as el
left join LicenseType as lt
on el.LicenseTypeID = lt.ID
where EmployeeID = @_employeeId
order by IssuedDate