import React, { useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import {
  Box,
  Button,
  ButtonGroup,
  Image,
  Input,
  Flex,
  useToast,
  Text,
  SimpleGrid,
  Badge,
  Spacer,
  Spinner,
  Center,
  Stack,
} from "@chakra-ui/react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import axios from "axios";
import { StarIcon } from "@chakra-ui/icons";
import App from "./App";
import {
  faAngleLeft,
  faAngleRight,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMap } from "@fortawesome/free-regular-svg-icons";
import { faBed } from "@fortawesome/free-solid-svg-icons/faBed";
import { RecentViewed } from "../../component/RecentViewed";

function PageButton({ variant, pageNumber, children }) {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  function handleClick() {
    params.set("p", pageNumber);
    const queryString = params.toString();
    navigate(`/hotel/?${queryString}`);
    // navigate("/?" + params);
  }

  return (
    <Button variant={variant} onClick={handleClick}>
      {children}
    </Button>
  );
}

function Pagination({ pageInfo }) {
  const pageNumbers = [];

  const navigate = useNavigate();

  for (let i = pageInfo.startPageNumber; i <= pageInfo.endPageNumber; i++) {
    pageNumbers.push(i);
  }

  return (
    <Box mt={5}>
      <Center>
        {pageInfo.prevPageNumber && (
          <PageButton variant="ghost" pageNumber={pageInfo.prevPageNumber}>
            <FontAwesomeIcon icon={faAngleLeft} />
          </PageButton>
        )}

        {pageNumbers.map((pageNumber) => (
          <PageButton
            key={pageNumber}
            variant={
              pageNumber === pageInfo.currentPageNumber ? "solid" : "ghost"
            }
            pageNumber={pageNumber}
          >
            {pageNumber}
          </PageButton>
        ))}

        {pageInfo.nextPageNumber && (
          <PageButton variant="ghost" pageNumber={pageInfo.nextPageNumber}>
            <FontAwesomeIcon icon={faAngleRight} />
          </PageButton>
        )}
      </Center>
    </Box>
  );
}

function SearchComponent() {
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();

  function handleSearch() {
    // /?k=keyword
    const params = new URLSearchParams();
    params.set("k", keyword);

    const queryString = params.toString();
    navigate(`/hotel/?${queryString}`);
    // navigate("/?" + params);
  }

  return (
    <Center mt={5}>
      <Flex>
        <Input
          w={"400px"}
          value={keyword}
          placeholder={"호텔 검색"}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <Button onClick={handleSearch}>검색</Button>
      </Flex>
    </Center>
  );
}

export function Hotel() {
  const toast = useToast();
  const navigate = useNavigate();
  const { id } = useParams();

  const location = useLocation();
  const [params] = useSearchParams();
  const [hotelList, setHotelList] = useState(null);
  const [pageInfo, setPageInfo] = useState(null);

  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    axios.get("/api/hotel/list?" + params).then((response) => {
      setHotelList(response.data.hotelList);
      setPageInfo(response.data.pageInfo);
    });
  }, [location]);

  // TODO : Login 하고 Hotel 페이지 접속시 userId 정보 얻기
  // useEffect(() => {
  //   axios
  //     .get(`/api/hotel/wishList/` + params.get("userId"))
  //     .then((response) => {
  //       setWishlist(response.data);
  //     });
  // }, []);

  const handleUpdateToWishlist = (hotelId) => {
    axios
      .get(`/api/hotel/reserv/id/${hotelId}`)
      .then((response) => {
        const hotelData = response.data;

        axios
          .post("/api/wishlist", {
            hotelId,
            name: hotelData.name,
            mainImgUrl: hotelData.mainImgUrl,
            location: hotelData.location,
            lodgingType: hotelData.lodgingType,
          })
          .catch(() => {
            toast({
              description: "위시리스트에 저장 중 에러 발생",
              status: "error",
            });
          });
      })
      .catch(() => {
        toast({
          description: "호텔 데이터를 가져오는 중 에러 발생",
          status: "error",
        });
      });
  };

  const toggleWishlist = (hotelId) => {
    if (wishlist.includes(hotelId)) {
      setWishlist((prev) => prev.filter((id) => id !== hotelId));
      handleUpdateToWishlist(hotelId);
      toast({
        description: "찜 삭제 완료.",
        colorScheme: "orange",
      });
    } else {
      handleUpdateToWishlist(hotelId);
      setWishlist((prev) => [...prev, hotelId]);
      toast({
        description: "찜 추가 완료.",
        status: "success",
      });
    }
  };

  if (hotelList == null) {
    return <Spinner />;
  }

  return (
    <Box>
      <Box w={"100%"} h={"500px"} mt={"20px"}>
        {/* 여기에 App 컴포넌트 내용 */}
        <App />
      </Box>

      {/* 미들 바 */}

      {/* 검색 버튼 */}
      <Box mt={"50px"}>
        <SearchComponent />
      </Box>
      <Box w={"80%"} ml={"10%"}>
        <Flex minWidth={"max-content"} alignItems={"center"} gap={"2"}>
          <Spacer />
          <Button
            ml={"300px"}
            variant={"solid"}
            color={"green"}
            onClick={() => navigate("/hotel/write/")}
          >
            호텔 추가
          </Button>
          <Button
            ml={"20px"}
            variant={"solid"}
            color={"green"}
            onClick={() => navigate("/reserv/" + id)}
          >
            호텔 삭제
          </Button>
        </Flex>
      </Box>

      {/* 호텔 정보 렌더링 */}
      <Flex justifyContent={"center"} flexWrap="wrap">
        <SimpleGrid columns={3} spacing={10} my={"20px"}>
          {hotelList.map((hotel) => (
            <Box
              maxW="sm"
              borderWidth="1px"
              borderRadius="lg"
              overflow="hidden"
            >
              <Box position="relative">
                <Image src={hotel.mainImgUrl} alt={hotel.name} />
                <Box
                  position="absolute"
                  top="2"
                  right="2"
                  onClick={() => toggleWishlist(hotel.hid)}
                  cursor="pointer"
                >
                  <FontAwesomeIcon
                    icon={faHeart}
                    color={wishlist.includes(hotel.hid) ? "red" : "gray"}
                    size={"2xl"}
                  />
                </Box>
              </Box>
              <Box p="6">
                <Box display="flex" alignItems="baseline">
                  <Badge borderRadius="full" px="2" colorScheme="teal">
                    New
                  </Badge>
                  <Box
                    color="gray.500"
                    fontWeight="semibold"
                    letterSpacing="wide"
                    fontSize="xs"
                    textTransform="uppercase"
                    ml="2"
                  >
                    {hotel.numberOfBed} beds &bull;
                  </Box>
                </Box>
                <Box
                  mt="1"
                  fontWeight="semibold"
                  as="h4"
                  lineHeight="tight"
                  noOfLines={1}
                >
                  {hotel.description}
                </Box>
                <Box
                  display="flex"
                  mt="2"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box>
                    {hotel.totalPrice}
                    <Box as="span" color="gray.600" fontSize="sm">
                      원 / 1박
                    </Box>
                  </Box>

                  <ButtonGroup spacing="2" size="sm" variant="outline">
                    <Button
                      colorScheme="red"
                      onClick={() => navigate("/hotel/reserv/" + hotel.hid)}
                    >
                      예약하기
                    </Button>
                    <Button colorScheme="blue">찜하기</Button>
                  </ButtonGroup>
                  <Box
                    position="fixed" // 절대 위치를 사용해 오버레이 설정
                    top="300" // 배너의 상단에서 시작
                    right="10" // 배너의 우측에서 시작
                    zIndex="10" // 다른 요소보다 위에 오도록 z-index 설정
                    p="4" // 패딩 값
                    bg="rgba(255, 255, 255, 0.3)" // 배경색
                    boxShadow="lg" // 그림자 효과
                    maxW="sm" // 최대 너비 설정
                    overflow="hidden" // 내용이 넘치면 숨김
                  >
                    <RecentViewed />
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
        </SimpleGrid>
      </Flex>

      <Pagination pageInfo={pageInfo} />
    </Box>
  );
}
