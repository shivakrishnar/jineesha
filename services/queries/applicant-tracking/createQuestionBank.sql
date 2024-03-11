insert into ATQuestionBank(
	CompanyID,
	ATQuestionTypeID,
	QuestionTitle,
	QuestionText,
	Active,
	Sequence,
	IsRequired
) values (
	@CompanyID,
	@ATQuestionTypeID,
	@QuestionTitle,
	@QuestionText,
	@Active,
	@Sequence,
	@IsRequired
)
select SCOPE_IDENTITY() as ID
