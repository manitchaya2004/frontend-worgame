import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";

import { SearchComponent } from "../components/SearchComponent";
import { useData } from "../hook/useData";
import { Title } from "./AdvantureFeature";
import BackArrow from "../components/BackArrow";
import { useLoadData } from "../../AuthPage/LoginPage/hook/useLoadData";
import { Loading } from "../../../components/Loading/Loading";


export const SpellCard = ({
  name,
  price,
  icon,
  onClick,
  selected,
}) => {
  return (
    <Box
      onClick={onClick}
      sx={{
        height: 140,
        // borderRadius: "10px",
        backgroundColor: "#ffffffff",
        border: "3px solid #2b1d14",

        boxShadow: "4px 4px 0px #2b1d14",

        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        p: 1,
        cursor: "pointer",

        transition: "all 0.15s ease-out",

        "&:hover": {
          transform: "translateY(-4px) scale(1.03)",
          boxShadow:
            "inset 0 2px 0 #fff3cf, 0 10px 0 #3e2615, 0 0 12px rgba(255,215,100,0.6)",
        },

        "&:active": {
          transform: "translateY(0)",
          boxShadow: "inset 0 2px 0 #fff3cf, 0 4px 0 #3e2615",
        },
      }}
    >
      {/* ICON */}
      <Box sx={{ fontSize: 34 }}>{icon}</Box>

      {/* NAME */}
      <Typography
        sx={{
          fontSize: 14,
          fontWeight: "bold",
          textAlign: "center",
          color: "#3e2615",
        }}
      >
        {name}
      </Typography>

      {/* PRICE TAG */}
      <Box
        sx={{
          backgroundColor: "#d4a24f",
          border: "2px solid #3e2615",
          borderRadius: "6px",
          px: 1,
          py: "2px",
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          boxShadow: "0 2px 0 #3e2615",
        }}
      >
        <Typography fontSize={12} fontWeight="bold">
          {price}
        </Typography>
        <Typography fontSize={12}>💰</Typography>
      </Box>
    </Box>
  );
};

const SearchAndFilterSection = ({
  inputValue,
  onChange,
  handleSearchChange,
}) => {
  return (
    <>
      <Box sx={{ width: "70%", mr: 2 }}>
        <SearchComponent
          value={inputValue}
          onChange={onChange}
          onSearch={handleSearchChange}
        />
      </Box>
      <Box sx={{ width: "30%" }}>
        {/* <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">Type</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            // value={age}
            label="Type"
            sx={{
              height: "40px",
              backgroundColor: "#ffffff",
             
              

              // "& .MuiSelect-select": {
              //   display: "flex",
              //   alignItems: "center",
              //   height: "100%",
              //   paddingY: 0,
              // },
            }}
            // onChange={handleChange}
          >
          
          </Select>
        </FormControl> */}
        <SearchComponent />
      </Box>
    </>
  );
};

const ListSection = ({
  items,
  selectedItem,
  onSelectItem,
}) => {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(2, 1fr)",
          sm: "repeat(4, 1fr)",
          md: "repeat(6, 1fr)",
        }, // ⭐ 6 ต่อแถว
        gap: 2,
        flex: 1,
        // overflowY: "auto",

        p: 1,
        pr: 1,
      }}
    >
      {items.map((item, index) => (
        <SpellCard
          key={index}
          name={item.name}
          price={item.price}
          selected={selectedItem?.id === item.id}
          onClick={() => onSelectItem(item)}
        />
      ))}
    </Box>
  );
};

const DetailItems = ({
  open,
  onClose,
}) => {
  return (
    <Dialog sx={{}} open={open} onClose={onClose}>
      <DialogTitle>Item Detail</DialogTitle>
      <DialogContent>
        {/* รายละเอียดไอเท็ม */}
        มะเห็นได้
        <></>
      </DialogContent>
    </Dialog>
  );
};

const ShopSpellFeature = () => {
  const { item, loading, searchItems, resetItems } = useData();
  const { fetchAllShop } = useLoadData();
  const navigate = useNavigate();

  const [openDetail, setOpenDetail] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [searchValue, setSearchValue] = useState("");

  const [selectedItem, setSelectedItem] = useState(null);
  const [qty, setQty] = useState(1);

  // search
  useEffect(() => {
    if (searchValue.trim() === "") {
      resetItems();
    } else {
      searchItems(searchValue);
    }
  }, [searchValue]);
  const handleSearchChange = () => {
    if (inputValue === searchValue) return;
    setSearchValue(inputValue);
  };

  useEffect(() => {
    fetchAllShop();
  }, [fetchAllShop]);

  // loading
  if (loading === "LOADING") {
    return (
      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
        }}
      >
        <Loading />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <BackArrow onClick={() => navigate("/home")} />
      <Box
        sx={{
          position: "fixed",
          top: "55%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          paddingTop: 6, // เผื่อหัว
          background: "linear-gradient(#7b4a3b, #5a3328)",
          border: "6px solid #7a1f1f",
          boxShadow: `
    inset 0 0 0 3px #d6b46a,
    0 0 20px rgba(180,40,40,0.5),
    0 20px 40px rgba(0,0,0,0.8)
  `,
          width: { xs: "90%", sm: "80%", md: "80%", lg: "80%" },
          height: "550px",
          padding: 2,
        }}
      >
        <Title title="SHOP MARKET" />
        <Box sx={{ display: "flex", padding: 2, mt: 2 }}>
          <SearchAndFilterSection
            inputValue={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            handleSearchChange={handleSearchChange}
          />
        </Box>
        <Box
          sx={{
            width: "100%",
            height: "calc(100% - 60px)",
            // backgroundColor: "blue",
            overflow: "auto",
            p: 1,
          }}
        >
          <ListSection
            items={item}
            selectedItem={selectedItem}
            onSelectItem={(item) => {
              setSelectedItem(item);
              setQty(1);
              setOpenDetail(true);
            }}
          />
        </Box>
        {/* กรณี click เพื่อดู detail และซื้อ */}

        {/* <Button onClick={() => navigate("/battle")}>play</Button> */}
      </Box>
      {selectedItem && (
        <DetailItems open={openDetail} onClose={() => setOpenDetail(false)} />
      )}
    </Box>
  );
};

export default ShopSpellFeature;
