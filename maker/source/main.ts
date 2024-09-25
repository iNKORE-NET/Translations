import { scriptPath } from "./common/constants";
import { PangulasSpacingValidator } from "./common/data/validators";


//console.log(scriptPath);

console.log(PangulasSpacingValidator.validate("中文English"));
console.log(PangulasSpacingValidator.validate("中文 English中文"));

console.log(PangulasSpacingValidator.validate("中文 English"));
console.log(PangulasSpacingValidator.validate("中文 English 中文"));

console.log(PangulasSpacingValidator.validate("中𠮷English 中文"));
console.log(PangulasSpacingValidator.validate("中𠮷 English 中文"));

console.log(PangulasSpacingValidator.validate("中(𠮷中)文"));
console.log(PangulasSpacingValidator.validate("中 (𠮷中) 文"));
console.log(PangulasSpacingValidator.validate("中 (Eng) En 文"));