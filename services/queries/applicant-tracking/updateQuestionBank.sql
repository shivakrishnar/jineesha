update ATQuestionBank set
	ATQuestionBankGroupID = @ATQuestionBankGroupID,
	ATQuestionTypeID = @ATQuestionTypeID,
	QuestionTitle = @QuestionTitle,
	QuestionText = @QuestionText,
	Active = @Active,
	Sequence = @Sequence,
	IsRequired = @IsRequired
where
    ID = @ID