declare @_emailAcknowledged as varchar(max) = '@emailAcknowledged', 
@_employeeId as int = @employeeId, 
@_id as int = @id

declare @tmp table(oldEmailAcknowledged nvarchar(max), newEmailAcknowledged  nvarchar(max))

update EmployeeLicense
set EmailAcknowledged = CASE WHEN (@_emailAcknowledged = 'true') THEN 1 ELSE 0 END
output 
    deleted.EmailAcknowledged as oldEmailAcknowledged,
    inserted.EmailAcknowledged as newEmailAcknowledged
into @tmp
where EmployeeID = @_employeeId
and ID = @_id;

select oldEmailAcknowledged as EmailAcknowledged from @tmp
select newEmailAcknowledged as EmailAcknowledged from @tmp