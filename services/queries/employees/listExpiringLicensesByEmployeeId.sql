declare @landingSectionHistoryInMonths as int, @_companyId as int = @companyId, @_employeeId as int = @employeeId

set @landingSectionHistoryInMonths = (select LandingSectionHistoryInMonths from Company where ID = @_companyId)

-- Get total count for pagination
select count(*) as totalCount from EmployeeLicense as el
left join LicenseType as lt
on el.LicenseTypeID = lt.ID
where EmployeeID = @_employeeId
and ExpirationDate <= convert(date, DATEADD(month, @landingSectionHistoryInMonths, GETDATE()))
and ExpirationDate >= convert(date, GETDATE())

select el.*, lt.CompanyID, lt.Code, lt.Description, lt.Priority, lt.Active from EmployeeLicense as el
left join LicenseType as lt
on el.LicenseTypeID = lt.ID
where EmployeeID = @_employeeId
and ExpirationDate <= convert(date, DATEADD(month, @landingSectionHistoryInMonths, GETDATE()))
and ExpirationDate >= convert(date, GETDATE())
order by ExpirationDate