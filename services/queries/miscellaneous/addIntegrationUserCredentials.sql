declare @_username as varchar(max) = '@username', @_password as varchar(max) = '@password'

update PRServiceLocation
set APIUsername = @_username, APIPassword = @_password

select APIUsername as newAPIUsername from PRServiceLocation
