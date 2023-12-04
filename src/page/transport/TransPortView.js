import {
  Box,
  Button,
  Card,
  CardBody,
  Center,
  Flex,
  FormControl,
  FormLabel,
  Image,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

export function TransPortView() {
  const [value, setValue] = useState(0);
  const [trans, setTrans] = useState("");

  const navigate = useNavigate();

  const toast = useToast();

  const handleChange = (value) => setValue(value);

  const { id } = useParams();

  useEffect(() => {
    axios
      .get("/api/transport/id/" + id)
      .then((response) => setTrans(response.data));
  }, []);

  if (trans === null) {
    return <Spinner />;
  }

  // 운송 상품 삭제 기능 시작 ----------------------------------------------------
  function handleTransDelete() {
    axios
      .delete("/api/transport/delete/" + id)
      .then(() => {
        toast({
          description: id + " 번 운송 상품이 삭제되었습니다.",
          colorScheme: "orange",
        });
        navigate(-1);
      })
      .catch(() => {
        toast({
          description: "운송 상품 삭제중 문제가 발생하였습니다.",
          status: "error",
        });
      });
  }
  // 운송 상품 삭제 기능 끝 ----------------------------------------------------

  return (
    <Center>
      <Box mt={10} w={"80%"} key={trans.tid}>
        <Flex alignItems="center" gap={"10px"}>
          <Button
            w={"100px"}
            h={"50px"}
            ml={"80%"}
            onClick={() => navigate("/transport/edit/" + trans.tid)}
          >
            수송 상품 수정
          </Button>
          <Button w={"100px"} h={"50px"} onClick={handleTransDelete}>
            수송 상품 삭제
          </Button>
        </Flex>
        <Flex justifyContent={"space-between"} mt={10}>
          <FormControl w={"750px"} h={"500px"} bg={"#d9d9d9"}>
            <FormLabel>메인 이미지</FormLabel>

            {/* 이미지 출력 */}
            {/*{trans.mainImage.map((file) => (*/}
            {/*  <Card key={file.id} my={5}>*/}
            {/*    <CardBody>*/}
            {/*      <Image width="100%" src={file.url} alt={file.name} />*/}
            {/*    </CardBody>*/}
            {/*  </Card>*/}
            {/*))}*/}
          </FormControl>
          <Card w={"400px"} h={"500px"} bg={"#d9d9d9"}>
            <CardBody w={"80%"} bg={"#eeeccc"} ml={"10%"}>
              <Box bg={"#f3eeee"} w={"200px"} h={"100px"}>
                {trans.transTitle}
              </Box>
              <Box w={"80%"} h={"50px"} bg={"#f3eeee"}>
                가격 : {trans.transPrice}원
              </Box>
              <FormControl maxW="200px" bg={"white"} mt={4}>
                <Flex>
                  <FormLabel fontSize={"1rem"}>인원 : </FormLabel>
                  <NumberInput
                    w={"150px"}
                    max={50}
                    min={1}
                    defaultValue={1}
                    onChange={handleChange}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </Flex>
              </FormControl>

              <Box w={"200px"} h={"80px"} bg={"#f3eeee"} mt={4}>
                출발일자 : {trans.transStartDay}
              </Box>
              <Flex justifyContent={"space-between"} mt={4}>
                <Button w={"165px"}>바로결제</Button>
                <Button w={"165px"}>장바구니</Button>
              </Flex>
              <Button w={"165px"} mt={4}>
                ❤️ 찜하기
              </Button>
            </CardBody>
          </Card>
        </Flex>
        <Box w={"100%"} h={"500px"} bg={"#d9d9d9"} mt={10} mb={20}>
          상품 상세 이미지 및, 설명
          <Box> 상품이미지들</Box>
          <Box> {trans.transContent}</Box>
        </Box>
      </Box>
    </Center>
  );
}
