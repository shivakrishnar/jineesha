declare @_employeeId as int = @employeeId

--Get total count for pagination 
select count(*) as totalCount from EmployeeEnrolledClass as ec
left join HRnextClass as hrc
on ec.ClassID = hrc.ID
where EmployeeID = @_employeeId

select ec.*, hrc.CompanyID, hrc.Title, hrc.Description, hrc.Duration, hrc.Instructor, hrc.Location, hrc.Credits, hrc.IsOpen, hrc.ClassTime, hrc.ExpirationDate  from  EmployeeEnrolledClass as ec
left join HRnextClass as hrc
on ec.ClassID = hrc.ID
where EmployeeID = @_employeeId
order by ClassTime