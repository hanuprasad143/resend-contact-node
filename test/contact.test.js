import test from 'node:test';
import assert from 'node:assert/strict';
import {validate,contactEmailHtml} from '../src/contact.js';
const valid={first_name:'Ada',last_name:'Lovelace',email:'ada@example.com',phone:'+1 555 123 4567',subject:'Hello',message:'A message'};
test('validates complete form',()=>assert.deepEqual(validate(valid),{fields:valid}));
test('rejects missing required field',()=>assert.match(validate({...valid,email:''}).error,/required/));
test('rejects invalid email',()=>assert.match(validate({...valid,email:'bad'}).error,/Invalid email/));
test('escapes HTML in email',()=>{const html=contactEmailHtml({...valid,message:'<script>alert(1)</script>'});assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('<script>'));});
