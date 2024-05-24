insert into ATQuestionBank(
	CompanyID,
	ATQuestionBankGroupID,
	ATQuestionTypeID,
	QuestionTitle,
	QuestionText,
	Active,
	Sequence,
	IsRequired
) values (
	@CompanyID,
	@ATQuestionBankGroupID,
	@ATQuestionTypeID,
	@QuestionTitle,
	@QuestionText,
	@Active,
	@Sequence,
	@IsRequired
)
select SCOPE_IDENTITY() as ID
