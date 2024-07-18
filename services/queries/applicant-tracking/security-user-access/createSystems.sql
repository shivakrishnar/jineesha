insert into Systems(
	Name,
	Description
) values (
	@Name,
	@Description
)
select SCOPE_IDENTITY() as ID