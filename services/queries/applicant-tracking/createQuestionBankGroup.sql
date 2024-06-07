insert into ATQuestionBankGroup(
	CompanyID,
	GroupName
) values (
	@CompanyID,
	@GroupName
)
select SCOPE_IDENTITY() as ID