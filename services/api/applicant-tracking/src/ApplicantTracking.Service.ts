import * as QuestionTypeService from './QuestionType.Service';
import * as QuestionBankService from './QuestionBank.Service';
import * as HardStatusTypeService from './HardStatusType.Service';
import * as SoftStatusTypeService from './SoftStatusType.Service';
import * as ApplicationVersionService from './ApplicationVersion.Service';
import * as ApplicationVersionCustomQuestionService from './ApplicationVersionCustomQuestion.Service';

const questionTypeService = QuestionTypeService;
const questionBankService = QuestionBankService;
const hardStatusTypeService = HardStatusTypeService;
const softStatusTypeService = SoftStatusTypeService;
const applicationVersionService = ApplicationVersionService;
const applicationVersionCustomQuestionService = ApplicationVersionCustomQuestionService;

export { 
    questionTypeService, 
    questionBankService,
    hardStatusTypeService,
    softStatusTypeService,
    applicationVersionService,
    applicationVersionCustomQuestionService,
};
