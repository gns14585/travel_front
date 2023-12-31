import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Center,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DaumPostcodeEmbed, { useDaumPostcodePopup } from "react-daum-postcode";
import { postcodeScriptUrl } from "react-daum-postcode/lib/loadPostcode";

export function UserSignup() {
  // ------------- 고객 정보 -------------
  const [userId, setUserId] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [userPostCode, setUserPostCode] = useState(""); // 우편번호
  const [userAddress, setUserAddress] = useState(""); // 도로명 주소
  const [userDetailAddress, setUserDetailAddress] = useState(""); // 상세주소
  const [phonePart1, setPhonePart1] = useState("");
  const [phonePart2, setPhonePart2] = useState("");
  const [phonePart3, setPhonePart3] = useState("");
  const [emailId, setEmailId] = useState("");
  const [emailDomain, setEmailDomain] = useState("");

  // ------------- SMS 정보 -------------
  const [sendSMS, setSendSMS] = useState("");
  const [sendSmsOk, setSendSmsOk] = useState(false);

  // ------------- 비밀번호 체크 -------------
  const [userPasswordCheck, setUserPasswordCheck] = useState("");

  // ------------- Id 중복확인 -------------
  const [userIdCheck, setUserIdCheck] = useState(false);

  // ------------- Email 중복확인 -------------
  const [userEmailCheck, setUserEmailCheck] = useState(false);

  // ------------- 연속 클릭 방지 -------------
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ------------- toast / navigate -------------
  const toast = useToast();
  const navigate = useNavigate();

  const [idPatternMatch, setIdPatternMatch] = useState(true);

  // ------------- 우편번호 검색 HOOK -------------
  // ------------- 카카오 우편번호 팝업 -------------
  const daumPostcode = useDaumPostcodePopup(postcodeScriptUrl);

  // ------------- 모달창 -------------
  const { isOpen, onClose, onOpen } = useDisclosure();

  // ------------- 가입버튼 활성화/비활성화 -------------
  let submitAvailable = true;

  // ------------- 중복확인 누르지 않을경우 가입버튼 비활성화 -------------
  if (!userIdCheck) {
    submitAvailable = false;
  }
  if (!userEmailCheck) {
    submitAvailable = false;
  }
  if (!sendSmsOk) {
    submitAvailable = false;
  }

  // ------------- 본인인증 버튼 한번 클릭 시 버튼 막기 -------------
  if (!phonePart1 || !phonePart2 || !phonePart3) {
    submitAvailable = false;
  }

  // ------------- 본인인증 버튼 input 값 바뀌면 다시 클릭 가능하도록 -------------

  // ------------- 패스워드 일치하지 않으면 가입버튼 비활성화 -------------
  if (userPassword !== userPasswordCheck) {
    submitAvailable = false;
  }

  function handleSubmit() {
    const combinedEmail = `${emailId}@${emailDomain}`;
    const combinedPhoneNumber = `${phonePart1}-${phonePart2}-${phonePart3}`;
    setIsSubmitting(true);

    axios
      .post("/api/member/signup", {
        userId,
        userPassword,
        userName,
        userPostCode,
        userAddress,
        userDetailAddress,
        userPhoneNumber: combinedPhoneNumber,
        userEmail: combinedEmail,
      })
      .then(() => {
        toast({
          description: "회원가입이 완료되었습니다.",
          status: "success",
        });
        navigate("/");
      })
      .catch((error) => {
        if (error.response.status === 401) {
          toast({
            description: "입력값을 확인해주세요.",
            status: "error",
          });
        } else {
          toast({
            description: "관리자에게 문의해주시기 바랍니다.",
            status: "error",
          });
        }
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }

  // ------------- ID 중복확인 -------------
  function handleIdCheck() {
    const searchParams = new URLSearchParams();
    searchParams.set("userId", userId);
    setIdPatternMatch(true);

    axios
      .get("/api/member/check?" + searchParams.toString())
      .then(() => {
        setUserIdCheck(false);
        toast({
          description: "이미 사용중인 ID 입니다.",
          status: "warning",
        });
      })
      .catch((error) => {
        setUserIdCheck(true);

        if (error.response.status === 400) {
          console.log(error.response.data);
          if (error.response.data.message) {
            setIdPatternMatch(false);
          }
          toast({
            description: "아이디를 입력해주시기 바랍니다.",
            status: "warning",
          });
        } else if (error.response.status === 404) {
          toast({
            description: "사용 가능한 ID 입니다.",
            status: "success",
          });
        }
      });
  }

  // ------------- SMS 인증 로직 -------------
  function handleSMSButton() {
    const combinedPhoneNumber = `${phonePart1}-${phonePart2}-${phonePart3}`;
    setIsSubmitting(true);

    axios
      .post("/api/member/sendSMS", {
        userPhoneNumber: combinedPhoneNumber,
      })
      .then(() => {
        toast({
          description: "인증번호가 발송되었습니다.",
          status: "success",
        });
      })
      .catch((error) => {
        if (error.response.status === 401) {
          toast({
            description: "핸드폰 번호를 다시 입력해주시기 바랍니다.",
            status: "error",
          });
        } else {
          toast({
            description: "관리자에게 문의해주시기 바랍니다.",
            status: "error",
          });
        }
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }

  function handleSMSOk() {
    const combinedPhoneNumber = `${phonePart1}-${phonePart2}-${phonePart3}`;
    axios
      .post("/api/member/sendSmsOk2", {
        verificationCode: sendSMS,
        userPhoneNumber: combinedPhoneNumber,
      })
      .then((response) => {
        setSendSmsOk(true);
        toast({
          description: "인증번호 확인되었습니다.",
          status: "success",
        });
      })
      .catch((error) => {
        if (error.response.status === 401) {
          // 인증되지 않거나 다른 값을 쓸 경우
          toast({
            description: "입력값을 확인해주세요",
            status: "error",
          });
        } else {
          toast({
            description: "관리자에게 문의해주시기 바랍니다.",
            status: "error",
          });
        }
      });
  }

  // 비밀번호 정규식
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

  const validatePassword = (password) => {
    return passwordRegex.test(password);
  };

  // 비밀번호 입력 핸들러
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setUserPassword(newPassword);
    setIsPasswordValid(validatePassword(newPassword)); // 입력값 유효성 검사
  };

  // ---------- 카카오 우편번호 API 로직 ----------
  const handleDaumPostcode = () => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        handleAddressComplete(data);
      },
    }).open();
  };
  const handleComplete = (data) => {
    let extraAddress = "";
    let address = data.address;

    if (data.addressType === "R" || data.addressType === "J") {
      if (data.bname !== "") {
        extraAddress += data.bname;
      }
      if (data.buildingName !== "") {
        extraAddress +=
          extraAddress !== "" ? `, ${data.buildingName}` : data.buildingName;
      }
      address += extraAddress !== "" ? ` (${extraAddress})` : "";
    }

    handleAddressComplete({
      zonecode: data.zonecode,
      address: address,
    });
  };
  const handleAddressComplete = (data) => {
    setUserPostCode(data.zonecode);
    setUserAddress(data.address);
    setUserDetailAddress(""); // 주소를 클릭할 때 상세주소를 초기화하거나 필요한 처리 수행
  };

  // ---------- 이메일 중복확인 ----------
  function handleEmailCheck() {
    const combinedEmail = `${emailId}@${emailDomain}`;
    const params1 = new URLSearchParams();
    params1.set("userEmail", combinedEmail);

    axios
      .get("/api/member/check?" + params1)
      .then(() => {
        setUserEmailCheck(false);
        toast({
          description: "이미 사용중인 Email 입니다.",
          status: "warning",
        });
      })
      .catch((error) => {
        if (error.response.status === 404) {
          setUserEmailCheck(true);
          toast({
            description: "사용 가능한 Email 입니다.",
            status: "success",
          });
        }
      });
  }

  // ---------- 회원가입 Form ----------
  return (
    <Center m={20}>
      <Card w={"xl"}>
        <CardHeader>
          <Heading textAlign={"center"}>회원가입</Heading>
        </CardHeader>

        <CardBody>
          <FormControl mb={3} isInvalid={!userIdCheck}>
            <Flex gap={2}>
              <FormLabel
                w={160}
                textAlign={"center"}
                display={"flex"}
                alignItems={"center"}
              >
                아이디
              </FormLabel>
              <Input
                value={userId}
                onChange={(e) => {
                  setUserId(e.target.value);
                  setUserIdCheck(false);
                }}
              />
              <Button onClick={handleIdCheck}>중복확인</Button>
            </Flex>
            <FormErrorMessage w={"63%"} ml={120}>
              ID 중복체크 해주세요.
            </FormErrorMessage>
            <FormHelperText
              w={"63%"}
              ml={120}
              color={idPatternMatch ? "gray" : "red"}
              fontSize={"12px"}
            >
              5자에서 20자 사이의 영문자와 숫자만 허용
            </FormHelperText>
          </FormControl>

          <FormControl mb={3}>
            <Flex>
              <FormLabel
                w={138}
                textAlign={"center"}
                display={"flex"}
                alignItems={"center"}
              >
                비밀번호
              </FormLabel>
              <Input
                type="password"
                value={userPassword}
                onChange={(e) => {
                  handlePasswordChange(e);
                  setUserPassword(e.target.value);
                }}
              />
            </Flex>
            <FormHelperText
              w={"63%"}
              ml={120}
              color={!isPasswordValid ? "red" : "gray"}
              fontSize={"12px"}
            >
              최소 8자 이상 숫자, 특수문자, 영문자 포함
            </FormHelperText>
          </FormControl>

          {userPassword.length > 0 && (
            <FormControl mb={3} isInvalid={userPassword !== userPasswordCheck}>
              <Flex textAlign={"center"} display={"flex"} alignItems={"center"}>
                <FormLabel
                  w={138}
                  textAlign={"center"}
                  display={"flex"}
                  alignItems={"center"}
                >
                  비밀번호 확인
                </FormLabel>
                <Input
                  type="password"
                  value={userPasswordCheck}
                  onChange={(e) => {
                    setUserPasswordCheck(e.target.value);
                  }}
                />
              </Flex>
              <FormErrorMessage w={"63%"} ml={120}>
                암호가 다릅니다.
              </FormErrorMessage>
            </FormControl>
          )}

          <FormControl mb={3}>
            <Flex>
              <FormLabel
                w={138}
                textAlign={"center"}
                display={"flex"}
                alignItems={"center"}
              >
                이름
              </FormLabel>
              <Input
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </Flex>
          </FormControl>

          <FormControl mb={3}>
            <Flex gap={2}>
              <FormLabel
                w={160}
                textAlign={"center"}
                display={"flex"}
                alignItems={"center"}
              >
                우편번호
              </FormLabel>
              <Input
                placeholder="우편번호"
                mb={3}
                value={userPostCode}
                readOnly
                onChange={(e) => setUserPostCode(e.target.value)} // 주소검색 버튼 클릭 시 팝업 열도록 설정
              />
              <Button onClick={handleDaumPostcode}>주소검색</Button>
            </Flex>

            <Flex>
              <FormLabel
                w={138}
                textAlign={"center"}
                display={"flex"}
                alignItems={"center"}
              >
                상세주소
              </FormLabel>
              <Input
                mb={3}
                value={userAddress}
                onChange={(e) => setUserAddress(e.target.value)}
              />
            </Flex>

            <Flex>
              <FormLabel
                w={138}
                textAlign={"center"}
                display={"flex"}
                alignItems={"center"}
              >
                나머지주소
              </FormLabel>
              <Input
                value={userDetailAddress}
                onChange={(e) => setUserDetailAddress(e.target.value)}
              />
            </Flex>
          </FormControl>

          <FormControl mb={3}>
            <Flex gap={2}>
              <FormLabel
                w={320}
                textAlign={"center"}
                display={"flex"}
                alignItems={"center"}
              >
                휴대전화
              </FormLabel>

              <Input
                type="number"
                value={phonePart1}
                w={200}
                onChange={(e) => setPhonePart1(e.target.value)}
              />
              <span
                style={{
                  justifyContent: "center",
                  display: "flex",
                  alignItems: "center",
                  fontSize: "13px",
                }}
              >
                <Box
                  style={{
                    fontSize: "16px",
                    verticalAlign: "middle",
                    margin: "0 8px",
                  }}
                >
                  -
                </Box>
              </span>

              <Input
                type="number"
                value={phonePart2}
                w={205}
                onChange={(e) => setPhonePart2(e.target.value)}
              />
              <span
                style={{
                  justifyContent: "center",
                  display: "flex",
                  alignItems: "center",
                  fontSize: "13px",
                }}
              >
                <Box
                  style={{
                    fontSize: "16px",
                    verticalAlign: "middle",
                    margin: "0 8px",
                  }}
                >
                  -
                </Box>
              </span>
              <Input
                type="number"
                value={phonePart3}
                w={205}
                onChange={(e) => setPhonePart3(e.target.value)}
              />
              <Button
                w={"170px"}
                isDisabled={isSubmitting}
                onClick={handleSMSButton}
              >
                본인인증
              </Button>
            </Flex>
          </FormControl>

          {phonePart1 && phonePart2 && phonePart3 && (
            <FormControl mb={3}>
              <Flex gap={2}>
                <FormLabel
                  w={160}
                  textAlign={"center"}
                  display={"flex"}
                  alignItems={"center"}
                >
                  본인인증번호
                </FormLabel>
                <Input
                  type="number"
                  value={sendSMS}
                  onChange={(e) => setSendSMS(e.target.value)}
                />
                <Button w={95} onClick={handleSMSOk}>
                  확인
                </Button>
              </Flex>
            </FormControl>
          )}

          <FormControl mb={3} isInvalid={!userEmailCheck}>
            <Flex gap={2}>
              <FormLabel
                w={160}
                textAlign={"center"}
                display={"flex"}
                alignItems={"center"}
              >
                이메일
              </FormLabel>
              <Input
                type="email"
                value={emailId}
                w={230}
                onChange={(e) => setEmailId(e.target.value)}
              />
              <span
                style={{
                  justifyContent: "center",
                  display: "flex",
                  alignItems: "center",
                  fontSize: "13px",
                }}
              >
                <Box
                  style={{
                    fontSize: "16px",
                    verticalAlign: "middle",
                    margin: "0 8px",
                  }}
                >
                  @
                </Box>
              </span>
              <Input
                type="email"
                value={emailDomain}
                w={200}
                onChange={(e) => setEmailDomain(e.target.value)}
              />
              <Button onClick={handleEmailCheck}>중복확인</Button>
            </Flex>
            <FormErrorMessage w={"63%"} ml={120}>
              이메일 중복확인 해주세요.
            </FormErrorMessage>
          </FormControl>
        </CardBody>

        <CardFooter>
          <Button
            isDisabled={!submitAvailable || isSubmitting}
            colorScheme="blue"
            onClick={handleSubmit}
          >
            가입
          </Button>
        </CardFooter>
      </Card>
    </Center>
  );
}
